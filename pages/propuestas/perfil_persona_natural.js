$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Creando link de navegación
    $("#link_terminos").attr("onclick", "location.href = 'perfiles.html?m=1&id=" + $("#id").val() + "&p=" + getURLParameter('p') + "'");
    $("#link_propuestas").attr("onclick", "location.href = 'propuestas.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "&p=" + getURLParameter('p') + "'");

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Valido el id de la propuesta
        if (Number.isInteger(parseInt(getURLParameter('p'))))
        {
            //Realizo la peticion para validar acceso a la convocatoria
            $.ajax({
                type: 'POST',
                data: {"token": token_actual.token, "p": getURLParameter('p')},
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
                                if (data == 'error_maximo')
                                {
                                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Ya tiene el máximo de propuestas guardadas permitidas para esta convocatoria, para visualizar sus propuestas por favor ingrese al menú Mis propuestas.&msg_tipo=danger';
                                } else
                                {
                                    if (data == 'error_propuesta')
                                    {
                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                                    } else
                                    {
                                        if (data == 'error_participante')
                                        {
                                            location.href = url_pv_admin + 'pages/index/index.html?msg=Para poder inscribir la propuesta debe crear al menos un perfil como participante.&msg_tipo=danger';
                                        } 
                                        else
                                        {                                        
                                            if (data == 'ingresar')
                                            {
                                                //Vacio el id
                                                $("#id").attr('value', "");
                                                //Asignamos el valor a input conv
                                                $("#conv").attr('value', getURLParameter('id'));

                                                //disabled todos los componentes
                                                $("#formulario_principal input,select,button[type=submit]").attr("disabled","disabled");   

                                                //Verifica si el token actual tiene acceso de lectura
                                                permiso_lectura(token_actual, "Menu Participante");

                                                //Valido formulario
                                                validator_form(token_actual);

                                                //Peticion para buscar barrios
                                                var json_barrio = function (request, response) {
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, "id": $("#id").attr('value'), q: request.term},
                                                        url: url_pv + 'Barrios/autocompletar/',
                                                        dataType: "jsonp",
                                                        success: function (data) {
                                                            response(data);
                                                        }
                                                    });
                                                };

                                                //Peticion para buscar ciudades
                                                var json_ciudades = function (request, response) {
                                                    $.ajax({
                                                        type: 'GET',
                                                        data: {"token": token_actual.token, "id": $("#id").attr('value'), q: request.term},
                                                        url: url_pv + 'Ciudades/autocompletar/',
                                                        dataType: "jsonp",
                                                        success: function (data) {
                                                            response(data);
                                                        }
                                                    });
                                                };

                                                //Cargos el autocomplete de barrios
                                                $("#barrio_residencia_name").autocomplete({
                                                    source: json_barrio,
                                                    minLength: 2,
                                                    select: function (event, ui) {
                                                        $(this).val(ui.item ? ui.item : " ");
                                                        $("#barrio_residencia").val(ui.item.id);
                                                    },
                                                    change: function (event, ui) {
                                                        if (!ui.item) {
                                                            this.value = '';
                                                            $("#barrio_residencia").val("");
                                                        }
                                                    }
                                                });

                                                //Cargos el autocomplete de ciudad de nacimiento                    
                                                $("#ciudad_nacimiento_name").autocomplete({
                                                    source: json_ciudades,
                                                    minLength: 2,
                                                    select: function (event, ui) {
                                                        $(this).val(ui.item ? ui.item : " ");
                                                        $("#ciudad_nacimiento").val(ui.item.id);
                                                    },
                                                    change: function (event, ui) {
                                                        if (!ui.item) {
                                                            this.value = '';
                                                            $("#ciudad_nacimiento").val("");
                                                        }
                                                        //else { Return your label here }
                                                    }
                                                });

                                                //Cargos el autocomplete de ciudad de residencia
                                                $("#ciudad_residencia_name").autocomplete({
                                                    source: json_ciudades,
                                                    minLength: 2,
                                                    select: function (event, ui) {
                                                        $(this).val(ui.item ? ui.item : " ");
                                                        $("#ciudad_residencia").val(ui.item.id);
                                                    },
                                                    change: function (event, ui) {
                                                        if (!ui.item) {
                                                            this.value = '';
                                                            $('.formulario_principal').bootstrapValidator('revalidateField', 'ciudad_residencia_name');
                                                            $("#ciudad_residencia").val("");
                                                        }
                                                        //else { Return your label here }
                                                    }
                                                });

                                                //Realizo la peticion para cargar el formulario
                                                $.ajax({
                                                    type: 'GET',
                                                    data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "p": getURLParameter('p')},
                                                    url: url_pv + 'Personasnaturales/buscar_participante/'
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
                                                            if (data == 'acceso_denegado')
                                                            {
                                                                notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                                            } else
                                                            {
                                                                if (data == 'crear_perfil')
                                                                {
                                                                    location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_natural.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona natural.&msg_tipo=danger';
                                                                } else
                                                                {
                                                                    if (data == 'error_participante_propuesta')
                                                                    {                                                                    
                                                                        location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
                                                                    } else
                                                                    {

                                                                        var json = JSON.parse(data);

                                                                        //eliminó disabled todos los componentes
                                                                        if(json.estado==7)
                                                                        {
                                                                            $("#formulario_principal input,select,button[type=submit]").removeAttr("disabled");   
                                                                        }


                                                                        //Cargos el select de tipo de documento
                                                                        $('#tipo_documento').find('option').remove();
                                                                        $("#tipo_documento").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.tipo_documento.length > 0) {
                                                                            $.each(json.tipo_documento, function (key, array) {
                                                                                var selected = '';
                                                                                if (array.id == json.participante.tipo_documento)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#tipo_documento").append('<option value="' + array.id + '" ' + selected + ' >' + array.descripcion + '</option>');
                                                                            });
                                                                        }
                                                                        //Cargos el select de sexo
                                                                        $('#sexo').find('option').remove();
                                                                        $("#sexo").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.sexo.length > 0) {
                                                                            $.each(json.sexo, function (key, array) {
                                                                                var selected = '';
                                                                                if (array.id == json.participante.sexo)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#sexo").append('<option value="' + array.id + '" ' + selected + ' >' + array.nombre + '</option>');
                                                                            });
                                                                        }
                                                                        //Cargos el select de orientacion sexual
                                                                        $('#orientacion_sexual').find('option').remove();
                                                                        $("#orientacion_sexual").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.orientacion_sexual.length > 0) {
                                                                            $.each(json.orientacion_sexual, function (key, array) {
                                                                                var selected = '';
                                                                                if (array.id == json.participante.orientacion_sexual)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#orientacion_sexual").append('<option value="' + array.id + '" ' + selected + ' >' + array.nombre + '</option>');
                                                                            });
                                                                        }
                                                                        //Cargos el select de identidad genero
                                                                        $('#identidad_genero').find('option').remove();
                                                                        $("#identidad_genero").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.orientacion_sexual.length > 0) {
                                                                            $.each(json.identidad_genero, function (key, array) {
                                                                                var selected = '';
                                                                                if (array.id == json.participante.identidad_genero)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#identidad_genero").append('<option value="' + array.id + '" ' + selected + ' >' + array.nombre + '</option>');
                                                                            });
                                                                        }
                                                                        //Cargos el select de grupo etnico
                                                                        $('#grupo_etnico').find('option').remove();
                                                                        $("#grupo_etnico").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.grupo_etnico.length > 0) {
                                                                            $.each(json.grupo_etnico, function (key, array) {
                                                                                var selected = '';
                                                                                if (array.id == json.participante.grupo_etnico)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#grupo_etnico").append('<option value="' + array.id + '" ' + selected + ' >' + array.nombre + '</option>');
                                                                            });
                                                                        }
                                                                        //Cargos el select de estrato
                                                                        $('#estrato').find('option').remove();
                                                                        $("#estrato").append('<option value="">:: Seleccionar ::</option>');
                                                                        if (json.estrato.length > 0) {
                                                                            $.each(json.estrato, function (key, array) {
                                                                                var selected = '';
                                                                                if (array == json.participante.estrato)
                                                                                {
                                                                                    selected = 'selected="selected"';
                                                                                }
                                                                                $("#estrato").append('<option value="' + array + '" ' + selected + ' >' + array + '</option>');
                                                                            });
                                                                        }

                                                                        //Asigno el nombre de las barrio
                                                                        $("#barrio_residencia_name").val(json.barrio_residencia_name);

                                                                        //Asigno el nombre de las ciudades
                                                                        $("#ciudad_nacimiento_name").val(json.ciudad_nacimiento_name);
                                                                        $("#ciudad_residencia_name").val(json.ciudad_residencia_name);

                                                                        //Cargo el formulario con los datos
                                                                        $('#formulario_principal').loadJSON(json.participante);
                                                                    }
                                                                }

                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        } else
        {
            location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=El código de la propuesta no es valido.&msg_tipo=danger';
        }
    }
});

function validator_form(token_actual) {
    //Se debe colocar debido a que el calendario es un componente diferente
    $('.calendario').on('changeDate show', function (e) {
        $('.formulario_principal').bootstrapValidator('revalidateField', 'fecha_nacimiento');
    });
    //Validar el formulario
    $('.formulario_principal').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            tipo_documento: {
                validators: {
                    notEmpty: {message: 'El tipo de documento de identificación es requerido'}
                }
            },
            numero_documento: {
                validators: {
                    notEmpty: {message: 'El número de documento de identificación es requerido'},
                    numeric: {message: 'Debe ingresar solo numeros'}
                }
            },
            primer_nombre: {
                validators: {
                    notEmpty: {message: 'El primer nombre es requerido'}
                }
            },
            primer_apellido: {
                validators: {
                    notEmpty: {message: 'El primer apellido es requerido'}
                }
            },
            fecha_nacimiento: {
                validators: {
                    notEmpty: {message: 'La fecha de nacimiento es requerida'}
                }
            },
            sexo: {
                validators: {
                    notEmpty: {message: 'El sexo es requerido'}
                }
            },
            ciudad_residencia_name: {
                validators: {
                    notEmpty: {message: 'La ciudad de residencia es requerida'}
                }
            },
            direccion_residencia: {
                validators: {
                    notEmpty: {message: 'La dirección de residencia es requerida'}
                }
            },
            estrato: {
                validators: {
                    notEmpty: {message: 'El estrato es requerido'}
                }
            },
            correo_electronico: {
                validators: {
                    notEmpty: {message: 'El correo electrónico es requerido'},
                    emailAddress: {
                        message: 'El Correo electrónico no es una dirección de correo electrónico válida'
                    }
                }
            }
        }
    }).on('success.form.bv', function (e) {

        $("#mi-modal").modal('show');

        var modalConfirm = function (callback) {
            $("#modal-btn-si").on("click", function () {
                callback(true);
                $("#mi-modal").modal('hide');
            });

            $("#modal-btn-no").on("click", function () {
                callback(false);
                $("#mi-modal").modal('hide');
            });
        };

        // Prevent form submission
        e.preventDefault();
        // Get the form instance
        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');

        // Valido si el id existe, con el fin de eviarlo al metodo correcto
        $('#formulario_principal').attr('action', url_pv + 'Personasnaturales/editar_participante');


        modalConfirm(function (confirm) {
            if (confirm) {
                //Se realiza la peticion con el fin de guardar el registro actual
                $.ajax({
                    type: 'POST',
                    url: $form.attr('action'),
                    data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token
                }).done(function (result) {

                    if (result == 'error')
                    {
                        notify("danger", "ok", "Persona natural:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    } else
                    {
                        if (result == 'error_token')
                        {
                            location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                        } else
                        {
                            if (result == 'acceso_denegado')
                            {
                                notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                            } else
                            {
                                if (result == 'error_usuario_perfil')
                                {
                                    notify("danger", "ok", "Persona natural:", "Se registro un error al crear el perfil, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                } else
                                {
                                    if (result == 'no_existente_participante')
                                    {
                                        location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_natural.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona natural.&msg_tipo=danger';
                                    } else
                                    {
                                        if (result == 'participante_existente')
                                        {
                                            notify("danger", "ok", "Persona natural:", "El participante que intenta ingresar ya se encuentra registrado en la base de datos, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                        } else
                                        {
                                            if (isNaN(result)) {
                                                notify("danger", "ok", "Persona natural:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                            } else
                                            {
                                                notify("success", "ok", "Persona natural:", "Se actualizó con éxito el participante como persona natural.");
                                                setTimeout(function(){location.href = url_pv_admin + 'pages/propuestas/propuestas.html?m=pn&id='+$("#conv").attr('value')+'&p='+getURLParameter('p');}, 1800);                                            
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                });
            } else
            {
                $form.bootstrapValidator('disableSubmitButtons', false);
            }
        });
    });

}