$(document).ready(function () {

    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    var href_regresar = "";
    //Creando link de navegación
    if (getURLParameter('m') == "agr")
    {
        href_regresar = "integrantes.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "";
    }

    if (getURLParameter('m') == "pn")
    {
        href_regresar = "propuestas.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "";
    }

    if (getURLParameter('m') == "pj")
    {
        href_regresar = "junta.html?m=" + getURLParameter('m') + "&id=" + getURLParameter('id') + "";
    }

    $("#link_regresar").attr("onclick", "location.href = '" + href_regresar + "'");

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        //Vacio el id
        $("#id").attr('value', "");
        //Asignamos el valor a input conv
        $("#conv").attr('value', getURLParameter('id'));

        //Verifica si el token actual tiene acceso de lectura
        permiso_lectura(token_actual, "Menu Participante");

        //Realizo la peticion para cargar el formulario
        $.ajax({
            type: 'GET',
            data: {"token": token_actual.token, "conv": $("#conv").attr('value'), "modulo": "Menu Participante", "m": getURLParameter('m')},
            url: url_pv + 'PropuestasDocumentacion/buscar_documentacion'
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
                    if (data == 'crear_perfil_pn')
                    {
                        location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_natural.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona natural.&msg_tipo=danger';
                    } else
                    {
                        if (data == 'crear_perfil_pj')
                        {
                            location.href = url_pv_admin + 'pages/perfilesparticipantes/persona_juridica.html?msg=Para poder inscribir la propuesta debe crear el perfil de persona juridica.&msg_tipo=danger';
                        } else
                        {
                            if (data == 'crear_perfil_agr')
                            {
                                location.href = url_pv_admin + 'pages/perfilesparticipantes/agrupacion.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                            } else
                            {

                                if (data == 'crear_propuesta')
                                {
                                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                                } else
                                {
                                    if (data == 'acceso_denegado')
                                    {
                                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                                    } else
                                    {
                                        var json = JSON.parse(data);

                                        $("#propuesta").attr("value", json.propuesta);
                                        $("#participante").attr("value", json.participante);

                                        var html_table = '';
                                        $.each(json.administrativos, function (key2, documento) {
                                            html_table = html_table + '<tr><td>' + documento.orden + '</td><td>' + documento.requisito + '</td><td>' + documento.descripcion + '</td><td>' + documento.archivos_permitidos + '</td><td>' + documento.tamano_permitido + ' MB</td><td><button title="' + documento.id + '" lang="' + documento.archivos_permitidos + '" dir="' + documento.tamano_permitido + '" type="button" class="btn btn-success btn_tecnico_documento" data-toggle="modal" data-target="#cargar_documento"><span class="glyphicon glyphicon-open"></span></button></td><td><button title="' + documento.id + '"  type="button" class="btn btn-primary btn_tecnico_link" data-toggle="modal" data-target="#cargar_link"><span class="glyphicon glyphicon-link"></span></button></td></tr>';
                                        });

                                        $("#tabla_administrativos").append(html_table);

                                        html_table = '';
                                        $.each(json.tecnicos, function (key2, documento) {
                                            html_table = html_table + '<tr><td>' + documento.orden + '</td><td>' + documento.requisito + '</td><td>' + documento.descripcion + '</td><td>' + documento.archivos_permitidos + '</td><td>' + documento.tamano_permitido + ' MB</td><td><button title="' + documento.id + '" lang="' + documento.archivos_permitidos + '" dir="' + documento.tamano_permitido + '" type="button" class="btn btn-success btn_tecnico_documento" data-toggle="modal" data-target="#cargar_documento"><span class="glyphicon glyphicon-open"></span></button></td><td><button title="' + documento.id + '"  type="button" class="btn btn-primary btn_tecnico_link" data-toggle="modal" data-target="#cargar_link"><span class="glyphicon glyphicon-link"></span></button></td></tr>';
                                        });

                                        $("#tabla_tecnicos").append(html_table);

                                        $(".btn_tecnico_documento").click(function () {
                                            var documento = $(this).attr("title");
                                            var permitidos = $(this).attr("lang");
                                            var tamano = $(this).attr("dir");
                                            $("#archivos_permitidos").html(permitidos);
                                            $("#documento").val(documento);
                                            $("#permitidos").val(permitidos);
                                            $("#tamano").val(tamano);

                                            cargar_tabla_archivos(token_actual, documento);
                                        });

                                        $(".btn_tecnico_link").click(function () {
                                            var documento = $(this).attr("title");
                                            $("#documento").val(documento);

                                            cargar_tabla_link(token_actual, documento);
                                        });

                                    }
                                }
                            }
                        }

                    }
                }
            }
        });

        $('input[type="file"]').change(function (evt) {

            var f = evt.target.files[0];
            var reader = new FileReader();

            // Cierre para capturar la información del archivo.
            reader.onload = function (fileLoadedEvent) {
                var srcData = fileLoadedEvent.target.result; // <--- data: base64
                var srcName = f.name;
                var srcSize = f.size;
                var srcType = f.type;
                var ext = srcName.split('.');
                // ahora obtenemos el ultimo valor despues el punto
                // obtenemos el length por si el archivo lleva nombre con mas de 2 puntos
                srcExt = ext[ext.length - 1];

                var permitidos = $("#permitidos").val();
                var documento = $("#documento").val();
                var tamano = $("#tamano").val();

                var extensiones = permitidos.split(',');

                if (extensiones.includes(srcExt))
                {
                    //mb -> bytes
                    permitidotamano = tamano * 1000 * 1000;
                    if (srcSize > permitidotamano)
                    {
                        notify("danger", "ok", "Documentación:", "El tamaño del archivo excede el permitido (" + tamano + " MB)");
                    } else
                    {
                        $.post(url_pv + 'PropuestasDocumentacion/guardar_archivo', {documento: documento, srcExt: srcExt, srcData: srcData, srcName: srcName, srcSize: srcSize, srcType: srcType, "token": token_actual.token, conv: $("#conv").attr('value'), modulo: "Menu Participante", m: getURLParameter('m'), propuesta: $("#propuesta").attr('value')}).done(function (data) {
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
                                        if (data == 'error_carpeta')
                                        {
                                            notify("danger", "ok", "Convocatorias:", "Se registro un error al subir el archivo en la carpeta, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                        } else
                                        {
                                            if (data == 'error_archivo')
                                            {
                                                notify("danger", "ok", "Convocatorias:", "Se registro un error al subir el archivo, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                            } else
                                            {
                                                notify("success", "ok", "Convocatorias:", "Se guardo con el éxito el archivo.");
                                                cargar_tabla_archivos(token_actual, documento);
                                            }
                                        }
                                    }
                                }
                            }

                        });
                    }
                } else
                {
                    notify("danger", "ok", "Documentación:", "Archivo no permitido");
                }

            };
            // Leer en el archivo como una URL de datos.                
            reader.readAsDataURL(f);
        });

        validator_form(token_actual);



        $("#inscribir_propuesta").click(function () {
            //Realizo la peticion para cargar el formulario
            $.ajax({
                type: 'GET',
                data: {"token": token_actual.token, conv: $("#conv").attr('value'), modulo: "Menu Participante", m: getURLParameter('m'), propuesta: $("#propuesta").attr('value')},
                url: url_pv + 'PropuestasDocumentacion/validar_requisitos'
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
                        if (data == 'crear_propuesta')
                        {
                            location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                        } else
                        {
                            if (data == 'acceso_denegado')
                            {
                                notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                            } else
                            {
                                var json = JSON.parse(data);

                                var count = Object.keys(json).length;

                                if (count > 0)
                                {
                                    var html_table = '<ul>';
                                    $.each(json, function (key, documento) {
                                        html_table = html_table + '<li>' + documento.nombre + '</li>';
                                    });
                                    html_table = html_table + '</ul>';
                                    notify("danger", "remove", "Convocatorias:", "<p>Los siguientes requisitos son obligatorios</p>" + html_table);
                                } else
                                {
                                    $("#mi-modal").modal('show');
                                }
                            }
                        }

                    }
                }
            });
        });

        var modalConfirm = function (callback) {
            $("#modal-btn-si").on("click", function () {
                callback(true);
                $("#mi-modal").modal('hide');
            });

            $("#modal-btn-no").on("click", function () {
                callback(false);
                $("#mi-modal").modal('hide');
            });

            $("#modal-btn-reporte").on("click", function () {
                callback(false);
                window.open(url_pv_report + "/reporte_propuesta_inscrita.php?token=" + token_actual.token + "&id=" + $("#propuesta").attr('value'), '_blank');
            });
        };

        modalConfirm(function (confirm) {
            if (confirm) {
                //Se realiza la peticion con el fin de guardar el registro actual
                $.ajax({
                    type: 'POST',
                    url: url_pv + 'Propuestas/inscribir_propuesta',
                    data: "conv=" + $("#conv").attr('value') + "&modulo=Menu Participante&token=" + token_actual.token + "&m=" + getURLParameter('m') + "&id=" + $("#propuesta").val(),
                }).done(function (result) {

                    if (result == 'error_estado')
                    {
                        notify("danger", "ok", "Propuesta:", "Su propuesta no esta en estado registrada, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    } else
                    {
                        if (result == 'error')
                        {
                            notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
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
                                    if (result == 'error_fecha_cierre')
                                    {
                                        notify("danger", "ok", "Convocatorias:", "La convocatoria ya no se encuentra disponible para inscribir su propuesta.");
                                    } else
                                    {
                                        if (isNaN(result)) {
                                            notify("danger", "ok", "Propuesta:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                                        } else
                                        {
                                            notify("success", "ok", "Convocatorias:", "Felicitaciones, su propuesta quedo inscrita en la plataforma.");
                                        }
                                    }
                                }
                            }
                        }
                    }

                });
            }
        });


    }
});

function cargar_tabla_archivos(token_actual, documento) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'GET',
        data: {documento: documento, "token": token_actual.token, conv: $("#conv").attr('value'), modulo: "Menu Participante", m: getURLParameter('m'), propuesta: $("#propuesta").attr('value')},
        url: url_pv + 'PropuestasDocumentacion/buscar_archivos'
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
                if (data == 'crear_propuesta')
                {
                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                } else
                {
                    if (data == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                    } else
                    {
                        var json = JSON.parse(data);

                        var html_table = '';
                        $("#tabla_archivos").html("");
                        $.each(json, function (key2, documento) {
                            html_table = html_table + '<tr class="tr_' + documento.id + '"><td>' + documento.nombre + '</td><td><button type="button" onclick="download_file(\'' + documento.id_alfresco + '\')" class="btn btn-success"><span class="glyphicon glyphicon-save"></span></button></td><td><button onclick="eliminar(\'' + documento.id + '\')" type="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button></td></tr>';
                        });
                        $("#tabla_archivos").append(html_table);

                    }
                }

            }
        }
    });
}

function cargar_tabla_link(token_actual, documento) {
    //Realizo la peticion para cargar el formulario
    $.ajax({
        type: 'GET',
        data: {documento: documento, "token": token_actual.token, conv: $("#conv").attr('value'), modulo: "Menu Participante", m: getURLParameter('m'), propuesta: $("#propuesta").attr('value')},
        url: url_pv + 'PropuestasDocumentacion/buscar_link'
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
                if (data == 'crear_propuesta')
                {
                    location.href = url_pv_admin + 'pages/propuestas/propuestas_busqueda_convocatorias.html?msg=Para poder inscribir la propuesta debe crear el perfil de agrupacion.&msg_tipo=danger';
                } else
                {
                    if (data == 'acceso_denegado')
                    {
                        notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                    } else
                    {
                        var json = JSON.parse(data);

                        var html_table = '';
                        $("#tabla_link").html("");
                        $.each(json, function (key2, documento) {
                            html_table = html_table + '<tr class="tr_link_' + documento.id + '"><td><a href="' + documento.link + '" target="_blank">' + documento.link + '</a></td><td><button onclick="eliminar_link(\'' + documento.id + '\')" type="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button></td></tr>';
                        });
                        $("#tabla_link").append(html_table);

                    }
                }

            }
        }
    });
}

//Funcion para descargar archivo
function download_file(cod)
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        $.AjaxDownloader({
            url: url_pv + 'PropuestasDocumentacion/download_file/',
            data: {
                cod: cod,
                token: token_actual.token,
                modulo: "Menu Participante"
            }
        });
    }

}

//Funcion para descargar archivo
function eliminar(id)
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante"},
            url: url_pv + 'PropuestasDocumentacion/delete/' + id
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
                    if (data == 'error')
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                        } else
                        {
                            notify("success", "ok", "Convocatorias:", "Se elimino con el éxito el archivo.");
                            $(".tr_" + id).remove();
                        }
                    }

                }
            }
        });
    }

}

//Funcion para descargar archivo
function eliminar_link(id)
{
    //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor                
    var token_actual = getLocalStorage(name_local_storage);

    //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
    if ($.isEmptyObject(token_actual)) {
        location.href = url_pv_admin + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
    } else
    {
        $.ajax({
            type: 'DELETE',
            data: {"token": token_actual.token, "modulo": "Menu Participante"},
            url: url_pv + 'PropuestasDocumentacion/delete_link/' + id
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
                    if (data == 'error')
                    {
                        notify("danger", "ok", "Convocatorias:", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                    } else
                    {
                        if (data == 'acceso_denegado')
                        {
                            notify("danger", "remove", "Convocatorias:", "No tiene permisos para ver la información.");
                        } else
                        {
                            notify("success", "ok", "Convocatorias:", "Se elimino con el éxito el archivo.");
                            $(".tr_link_" + id).remove();
                        }
                    }

                }
            }
        });
    }

}

function validator_form(token_actual) {

    //Validar el formulario
    $('.formulario_link').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            link: {
                validators: {
                    notEmpty: {message: 'El link es requerido'},
                    regexp: {
                        regexp: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/,
                        message: 'Debe ingresar un link correcto ejemplo (https://www.culturarecreacionydeporte.gov.co)'
                    }
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

        // Valido si el id existe, con el fin de eviarlo al metodo correcto
        $('#formulario_link').attr('action', url_pv + 'PropuestasDocumentacion/guardar_link');

        var documento = $("#documento").val();

        //Se realiza la peticion con el fin de guardar el registro actual
        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: "modulo=Menu Participante&token=" + token_actual.token + "&documento=" + documento + "&conv=" + $("#conv").attr('value') + "&m=" + getURLParameter('m') + "&propuesta=" + $("#propuesta").attr('value') + "&link=" + $("#link").val()
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
                        if (data == 'error_carpeta')
                        {
                            notify("danger", "ok", "Convocatorias:", "Se registro un error al subir el archivo en la carpeta, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                        } else
                        {
                            notify("success", "ok", "Convocatorias:", "Se guardo con el éxito el archivo.");
                            cargar_tabla_link(token_actual, documento);

                        }
                    }
                }
            }

        });

        $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
    });

}