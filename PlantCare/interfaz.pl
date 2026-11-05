:- use_module(library(pce)).

% Cargar automáticamente los archivos del proyecto (incluyendo plantcare.pl)
:- [plantcare].

% =========================================================
% INTERFAZ GRAFICA PRINCIPAL DE PLANTCARE
% =========================================================

interfaz_plantcare :-
    new(Dialog, dialog('PlantCare - Sistema Experto de Plantas')),
    
    send(Dialog, append, new(text('=== SISTEMA EXPERTO PLANTCARE ===', center, bold))),
    send(Dialog, append, new(text('Selecciona una opcion para interactuar con el sistema:'))),
    
    send(Dialog, append, button('1. Analizar mi planta (Diagnostico)',
        message(@prolog, abrir_ventana_diagnostico))),
    
    send(Dialog, append, button('2. Consultar informacion del sistema',
        message(@prolog, abrir_ventana_informacion))),
    
    send(Dialog, append, button('3. Consultar historial de registros',
        message(@prolog, abrir_ventana_historial))),
    
    send(Dialog, append, button('4. Ver sintoma mas frecuente',
        message(@prolog, abrir_ventana_estadisticas))),
    
    send(Dialog, append, button('Salir', message(Dialog, destroy))),
    
    send(Dialog, open).

% =========================================================
% MODULO 1: VENTANA DE DIAGNOSTICO (CAPTURA DE DATOS)
% =========================================================

abrir_ventana_diagnostico :-
    new(Dlg, dialog('Analisis de Planta - Diagnostico')),
    
    send(Dlg, append, new(TSintoma, text_item(sintoma_principal, hojas_amarillas))),
    send(Dlg, append, new(DHumedad, text_item(humedad_suelo, baja))),
    send(Dlg, append, new(DIlumi, text_item(iluminacion, baja))),
    send(Dlg, append, new(DRiego, text_item(frecuencia_riego, poco_frecuente))),

    send(Dlg, append, button('Analizar y Diagnosticar',
        message(@prolog, procesar_diagnostico_gui, Dlg, TSintoma, DHumedad, DIlumi, DRiego))),
    
    send(Dlg, append, button('Cancelar', message(Dlg, destroy))),
    send(Dlg, open).

% Procesar y ejecutar las reglas de inferencia
procesar_diagnostico_gui(Dlg, TSintoma, DHumedad, DIlumi, DRiego) :-
    get(TSintoma, selection, Sintoma),
    get(DHumedad, selection, Humedad),
    get(DIlumi, selection, Iluminacion),
    get(DRiego, selection, Riego),

    % Limpiar e ingresar hechos
    limpiar_datos,
    assertz(sintoma(Sintoma)),
    assertz(humedad(Humedad)),
    assertz(iluminacion(Iluminacion)),
    assertz(riego(Riego)),

    % Evaluar motor de inferencia (Reglas r1 a r9)
    (   recomendacion(Regla, Problema, Consejo, Explicacion) ->
        (catch(guardar_registro(Problema), _, true) -> true ; true),
        send(Dlg, destroy),
        
        new(ResDlg, dialog('Resultado de Diagnostico')),
        send(ResDlg, append, new(text(string('Regla Aplicada: %s\nPosible Problema: %s\nExplicacion: %s\nRecomendacion: %s', Regla, Problema, Explicacion, Consejo)))),
        send(ResDlg, append, button('Aceptar', message(ResDlg, destroy))),
        send(ResDlg, open)
    ;   sintoma(no_se); humedad(no_se); iluminacion(no_se); riego(no_se) ->
        new(ErrorDlg, dialog('Informacion Incompleta')),
        send(ErrorDlg, append, new(text('No hay informacion suficiente.\nRevisa los datos desconocidos e intenta nuevamente.'))),
        send(ErrorDlg, append, button('OK', message(ErrorDlg, destroy))),
        send(ErrorDlg, open)
    ;   new(ErrorDlg2, dialog('Sin Regla Aplicable')),
        send(ErrorDlg2, append, new(text('No existe una regla aplicable a esta situacion.\nConsulta a un especialista.'))),
        send(ErrorDlg2, append, button('OK', message(ErrorDlg2, destroy))),
        send(ErrorDlg2, open)
    ).

% =========================================================
% MODULO 2: INFORMACION DEL SISTEMA
% =========================================================

abrir_ventana_informacion :-
    new(InfoDlg, dialog('Informacion de PlantCare')),
    send(InfoDlg, append, new(text('PlantCare analiza cuatro variables principales:'))),
    send(InfoDlg, append, new(text('1. Sintomas de la planta.'))),
    send(InfoDlg, append, new(text('2. Humedad del suelo.'))),
    send(InfoDlg, append, new(text('3. Iluminacion.'))),
    send(InfoDlg, append, new(text('4. Frecuencia de riego.'))),
    send(InfoDlg, append, new(text('Las recomendaciones son orientativas.'))),
    send(InfoDlg, append, button('Cerrar', message(InfoDlg, destroy))),
    send(InfoDlg, open).

% =========================================================
% MODULO 3: CONSULTA DE HISTORIAL (REGISTROS)
% =========================================================

abrir_ventana_historial :-
    new(HistDlg, dialog('Historial de Registros - PlantCare')),
    findall(
        string('ID: %s | Fecha: %s | Sintoma: %s | Humedad: %s | Riego: %s -> %s', Id, Fecha, Sintoma, Humedad, Riego, Problema),
        registro(Id, Fecha, Sintoma, Humedad, _, Riego, Problema),
        ListaRegistros
    ),
    (   ListaRegistros \== [] ->
        send(HistDlg, append, new(text('Consultas registradas en la base de datos:'))),
        forall(member(RegText, ListaRegistros),
            send(HistDlg, append, new(text(RegText))))
    ;   send(HistDlg, append, new(text('Todavia no hay consultas guardadas en el historial.')))
    ),
    send(HistDlg, append, button('Cerrar', message(HistDlg, destroy))),
    send(HistDlg, open).

% =========================================================
% MODULO 4: ESTADISTICAS (SINTOMA MAS FRECUENTE - GUI)
% =========================================================

abrir_ventana_estadisticas :-
    new(StatDlg, dialog('Estadisticas - Sintoma Mas Frecuente')),
    findall(Sintoma, registro(_, _, Sintoma, _, _, _, _), ListaSintomas),
    (   ListaSintomas \== [] ->
        list_to_set(ListaSintomas, SintomasUnicos),
        mapear_frecuencias_gui(StatDlg, SintomasUnicos, ListaSintomas)
    ;   send(StatDlg, append, new(text('Aun no hay registros guardados en el historial.')))
    ),
    send(StatDlg, append, button('Cerrar', message(StatDlg, destroy))),
    send(StatDlg, open).

mapear_frecuencias_gui(StatDlg, SintomasUnicos, ListaSintomas) :-
    maplist(contar_sintoma_gui(ListaSintomas), SintomasUnicos, ParesFrecuencia),
    max_member(MaxCount-SintomaTop, ParesFrecuencia),
    format(string(TextoEstadistica), 'REPORTE ESTADISTICO\n\nEl sintoma mas frecuente es:\n-> "~w"\nCon un total de ~w registro(s).', [SintomaTop, MaxCount]),
    send(StatDlg, append, new(text(TextoEstadistica))).

contar_sintoma_gui(ListaTotal, Sintoma, Count-Sintoma) :-
    aggregate_all(count, (member(Sintoma, ListaTotal)), Count).