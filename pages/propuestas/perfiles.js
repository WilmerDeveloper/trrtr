$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {

        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Menu Participante");

        //Realizo la peticion para validar acceso a la convocatoria
        $.ajax({
            type: 'POST',
            data: {"token": token_actual.token},
            url: url_pv + 'PropuestasBusquedasConvocatorias/validar_acceso/' + $("#id").val()
        }).done(function (data) {
            if (data == 'error_metodo')
            {
                notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
            } else
            {
                if (data == 'error_token')
                {
                    location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                } else
                {
                    if (data == 'error_fecha_cierre')
                    {
                        notify("danger", "ok", "Convocatorias:", "La convocatoria ya no se encuentra disponible para inscribir su propuesta.");
                    } else
                    {
                        if (data == 'error_fecha_apertura')
                        {
                            notify("danger", "ok", "Convocatorias:", "La convocatoria esta en estado publicada, por favor revisar la fecha de apertura en el cronograma de la convocatoria.");
                        } else
                        {
                            if (data == 'ingresar')
                            {
                                $(".validar_acceso").css("display", "block");


                                //Realizo la peticion para cargar los tipos de participantes
                                $.ajax({
                                    type: 'POST',
                                    data: {"token": token_actual.token},
                                    url: url_pv + 'PropuestasPerfiles/consultar_tipos_participantes/' + $("#id").val()
                                }).done(function (data) {
                                    
                                    var json = JSON.parse(data);
                                    
                                    if (data == 'error_metodo')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                    } else
                                    {
                                        if (data == 'error_token')
                                        {
                                            location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                                        } 
                                        else
                                        {
                                            $("#tipo_participante").append('<option value="">:: Seleccionar ::</option>');
                                            if (json.length > 0) {
                                                $.each(json, function (key, value) {
                                                    $("#tipo_participante").append('<option value="' + value.id + '" title="' + value.terminos_condiciones + '" lang="' + value.condiciones_participacion + '" dir="' + value.acepto_terminos_condiciones + '">' + value.tipo_participante + '</option>');
                                                });
                                            }                                                                                        
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
        });
        
        
        //Cargo los pdf deacuerdo al participante                                    
        $('#tipo_participante').on('change', function () {
            if($(this).val()!="")
            {
                $(".inactivo").css("display","block");
                $("#terminos_condiciones_pdf").attr("src",$("#tipo_participante option:selected").attr("title"));
                $("#condiciones_participacion_pdf").attr("src",$("#tipo_participante option:selected").attr("lang"));                                
                if($("#tipo_participante option:selected").attr("dir")=="true")
                {
                    $("#terminos_condiciones option[value='"+$("#tipo_participante option:selected").attr("dir")+"']").prop('selected', true);
                    $("#condiciones_participacion option[value='"+$("#tipo_participante option:selected").attr("dir")+"']").prop('selected', true);                
                }   
                else
                {
                    $('#terminos_condiciones option').prop('selected', function() {
                        return this.defaultSelected;
                    });
                    $('#condiciones_participacion option').prop('selected', function() {
                        return this.defaultSelected;
                    });                    
                }
            }
            else
            {
                $(".inactivo").css("display","none");                                         
            }
        });
        
        
        //Validar el formulario
        $('.form_validator').bootstrapValidator({
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                tipo_participante: {
                    validators: {
                        notEmpty: {message: 'El tipo participante es requerido'}
                    }
                },
                terminos_condiciones: {
                    validators: {
                        notEmpty: {message: 'Los términos, las condiciones, el tratamiento de datos y la autorización de uso, son requeridos'}
                    }
                },
                condiciones_participacion: {
                    validators: {
                        notEmpty: {message: 'Las condiciones generales de participación, son requeridas'}
                    }
                }
            }
        }).on('success.form.bv', function (e) {
            // Prevent form submission
            e.preventDefault();
            // Get the form instance
            var $form = $(e.target);

            // Get the BootstrapValidator instance
            var bv = $form.data('bootstrapValidator');
            
            var tipo_participante = $("#tipo_participante").val();
            var id = $("#id").val();
            
            var redirect = "";
            var m = "";
            if (tipo_participante == 1)
            {
                redirect = "perfil_persona_natural";
                m="pn";
            }
            if (tipo_participante == 2)
            {
                redirect = "perfil_persona_juridica";
                m="pj";
            }
            if (tipo_participante == 3)
            {
                redirect = "perfil_agrupacion";
                m="agr";
            }

            location.href = redirect + ".html?m=" + m + "&id="+id;           
            
            bv.resetForm();
        });

    }
});