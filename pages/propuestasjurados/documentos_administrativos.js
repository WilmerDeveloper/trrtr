/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

 /*Cesar Britto*/
 $(document).ready(function () {


    $("#idc").val($("#id").val());
    $("#id").val(null);

     //Verifico si el token exite en el cliente y verifico que el token este activo en el servidor
     var token_actual = getLocalStorage(name_local_storage);

     //Verifico si el token esta vacio, para enviarlo a que ingrese de nuevo
     if ($.isEmptyObject(token_actual)) {
         location.href = '../../index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
     } else
     {
         //Verifica si el token actual tiene acceso de lectura
         permiso_lectura(token_actual, "Menu Participante");
         cargar_datos_formulario(token_actual);
         cargar_tabla(token_actual);
         validator_form(token_actual);


       }

 });

 function cargar_datos_formulario(token_actual){

   // cargo los datos
   $.ajax({
       type: 'GET',
       url: url_pv + 'PropuestasJurados/search_documento',
       data: {"token": token_actual.token, "idc": $("#idc").val(), "idregistro": $("#idregistro").val()},

   }).done(function (data) {

     switch (data) {
       case 'error':
         notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
         break;
       case 'error_metodo':
           notify("danger", "ok", "Se registro un error en el método, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
           break;
       case 'error_token':
         location.href = url_pv + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
         break;
       case 'acceso_denegado':
         notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
         break;
       default:

         var json = JSON.parse(data);

         if( json.usuario_perfil ){

           //Cargos el select de tipo_entidad
           $('#categoria_jurado').find('option').remove();
           $("#categoria_jurado").append('<option value="">:: Seleccionar ::</option>');
           if (json.tipo.length > 0) {
               $.each(json.tipo, function (key, array) {
                   $("#categoria_jurado").append('<option value="' + array.id + '" >' + array.nombre + '</option>');
               });
           }


           //Cargo el formulario con los datos
           if( json.documento ){
             $('.formulario_principal').loadJSON(json.documento);
           }

           $("#formulario_principal").show();

         }else{

           //window.location.href = url_pv_admin+"pages/perfilesparticipantes/jurado.html";
           notify("danger", "ok", "Convocatorias:", "No tiene el perfil de participante para esta convocatoria");

         }

         break;
       }

     }

     );

 }

 function cargar_tabla(token_actual){
   console.log("idconvocatoria-->"+$("#idc").val() );
   //Cargar datos en la tabla actual
   $('#table_list').DataTable({
                 "language": {
                     "url": "../../dist/libraries/datatables/js/spanish.json"
                 },
                 "processing": true,
                 "destroy": true,
                 "serverSide": true,
                 "lengthMenu": [10, 15, 20],
                 "ajax":{
                     url : url_pv+"PropuestasJurados/all_documento",
                     data: {"token": token_actual.token, "idc": $("#idc").val() },
                     async: false
                   },
                   "drawCallback": function (settings) {
                      //$(".check_activar_t").attr("checked", "true");
                      //$(".check_activar_f").removeAttr("checked");
                      acciones_registro(token_actual);
                     },
                 "columns": [

                     {"data": "Documento",
                       render: function ( data, type, row ) {
                             return row.categoria_jurado;
                             },
                     },
                     {"data": "Seleccionar",
                       render: function ( data, type, row ) {
                             return ' <input title=\"'+row.id+'\" type=\"checkbox\" class=\"check_activar_'+row.active+'  activar_registro" '+(row.active? 'checked ':'')+' />';
                             },
                     },
                     {"data": "aciones",
                               render: function ( data, type, row ) {
                                           return '<button title="'+row.id+'" type="button" class="btn btn-warning btn_cargar" data-toggle="modal" data-target="#nueva_ronda\">'
                                               +'<span class="glyphicon glyphicon-edit"></span></button>'
                                               +'<button title="'+row.file+'" type="button" class="btn btn-primary download_file"><span class="glyphicon glyphicon-download-alt"></span></button>';
                                           },
                     }

                 ]
             });

 }

 function validator_form(token_actual) {

       //Validar el formulario
       $('.formulario_principal').bootstrapValidator({
           feedbackIcons: {
               valid: 'glyphicon glyphicon-ok',
               invalid: 'glyphicon glyphicon-remove',
               validating: 'glyphicon glyphicon-refresh'
           },
           fields: {
               documento:{
                 validators: {
                     notEmpty: {message: 'El tipo de documento es requerido'}
                 }
               },
             }

       }).on('success.form.bv', function (e) {
           // Prevent form submission
           e.preventDefault();
           // Get the form instance
           var $form = $(e.target);

           // Get the BootstrapValidator instance
           var bv = $form.data('bootstrapValidator');

           var formData = new FormData(document.getElementById("formulario_principal"));
           formData.append("modulo", "Menu Participante");
           formData.append("token", token_actual.token);
           formData.append("convocatoria", $("#id").attr('value'));
           formData.append("anexos", "documentacion");

           console.log("formData-->"+formData);

           console.log("idregistro-->"+$("#idregistro").val());

           if (typeof $("#idregistro").attr('value') == 'undefined'  || $("#idregistro").val() =='' ) {
                 console.log("guardar");

                 //$("#id").val($("#idp").attr('value'));
                 //Se realiza la peticion con el fin de guardar el registro actual
                 $.ajax({
                     type: 'POST',
                     url: url_pv + 'PropuestasJurados/new_documento',
                     //data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token,
                     data: formData,
                     cache: false,
                     contentType: false,
                     processData: false,
                     async: false

                 }).done(function (result) {


                   switch (result) {
                     case 'error':
                       notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                       break;
                     case 'error_token':
                       location.href = url_pv + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                       break;
                     case 'acceso_denegado':
                       notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                       break;
                     case 'deshabilitado':
                       notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                      // cargar_datos_formulario(token_actual);
                       break;
                     case 'error_creo_alfresco':
                       notify("danger", "remove", "Usuario:", "Se registró un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                       //cargar_datos_formulario(token_actual);
                       break;
                     default:
                       notify("success", "ok", "Convocatorias:", "Se agregó el registro con éxito.");
                       //cargar_datos_formulario(token_actual);
                       break;
                   }


                 });

             }else{
                 console.log("Actualizar");
                 console.log("Actualizar -->"+$("#idregistro").val());


                 $.ajax({
                     type: 'POST',
                     url: url_pv + 'PropuestasJurados/edit_documento/' + $("#idregistro").val(),
                     //data: $form.serialize() + "&modulo=Menu Participante&token=" + token_actual.token,
                     data: formData,
                     cache: false,
                     contentType: false,
                     processData: false,
                     async: false
                 }).done(function (result) {

                   switch (result) {
                     case 'error':
                       notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                       break;
                     case 'error_token':
                       location.href = url_pv + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
                       break;
                     case 'acceso_denegado':
                       notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                       break;
                     case 'deshabilitado':
                       notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
                       //cargar_datos_formulario(token_actual);
                       break;
                     case 'error_creo_alfresco':
                       notify("danger", "remove", "Usuario:", "Se registró un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
                       //cargar_datos_formulario(token_actual);
                       break;
                     default:
                       notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
                       //cargar_datos_formulario(token_actual);
                       break;
                   }

                 }
               );



             }


           $("#idregistro").val(null);
           $form.bootstrapValidator('disableSubmitButtons', false).bootstrapValidator('resetForm', true);
           //$form.bootstrapValidator('destroy', true);
           bv.resetForm();
           cargar_datos_formulario(token_actual);
           cargar_tabla(token_actual);
       });

   }

   //Permite realizar acciones despues de cargar la tabla
 function acciones_registro(token_actual) {

     //Permite realizar la carga respectiva de cada registro
     $(".btn_cargar").click(function () {
         $("#idregistro").val( $(this).attr("title") );
         // cargo los datos
         cargar_datos_formulario(token_actual);
     });

     //Permite activar o eliminar una registro
     $(".activar_registro").click(function () {

         //Cambio el estado del check
         var active = "false";

         if ($(this).prop('checked')) {
             active = "true";
         }

         //Peticion para inactivar el evento
         $.ajax({
             type: 'DELETE',
             data: {"token": token_actual.token, "modulo": "Menu Participante", "active": active, "idc": $("#idc").val()},
             url: url_pv + 'PropuestasJurados/delete_documento/' + $(this).attr("title")
         }).done(function (result) {

           switch (result) {
             case 'Si':
                 notify("info", "ok", "Convocatorias:", "Se activó el registro con éxito.");
                 break;
             case 'No':
                   notify("info", "ok", "Convocatorias:", "Se desactivó el registro con éxito.");
                   break;
             case 'error':
               notify("danger", "ok", "Convocatorias:", "Se registro un error, comuníquese con la mesa de ayuda soporte.convocatorias@scrd.gov.co");
               break;
             case 'error_token':
               location.href = url_pv + 'index.html?msg=Su sesión ha expirado, por favor vuelva a ingresar.&msg_tipo=danger';
               break;
             case 'acceso_denegado':
               notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
               break;
             case 'deshabilitado':
               notify("danger", "remove", "Usuario:", "No tiene permisos para editar información.");
               cargar_datos_formulario(token_actual);
               break;
             default:
               notify("success", "ok", "Convocatorias:", "Se actualizó el registro con éxito.");
               cargar_datos_formulario(token_actual);
               break;
           }


         });
     });

     //desarcar archivo
     $(".download_file").click(function () {
       //Cargo el id file
       var cod = $(this).attr('title');

       $.AjaxDownloader({
           url: url_pv + 'PropuestasJurados/download_file/',
           data : {
               cod   : cod,
               token   : token_actual.token
           }
       });

     });

   }