% Sistema experto plantcare
:- encoding(utf8).
:- dynamic sintoma/1.
:- dynamic humedad/1.
:- dynamic iluminacion/1.
:- dynamic riego/1.
:- dynamic registro/7.

:- consult('conocimientos.pl').
% Cargar los registros guardados
:- consult('datos_plantcare.pl').

% iniciar el sistema
inicio :-
    limpiar_datos,
    nl,
    ansi_format([bold, fg(green)],
        '============================================~n', []),
    ansi_format([bold, fg(green)],
        '                     PLANTCARE~n', []),
    ansi_format([fg(cyan)],
        '         Asistente inteligente para plantas~n', []),
    ansi_format([bold, fg(green)],
        '============================================~n', []),
    menu.


menu :-
    nl,
    ansi_format([bold, fg(cyan)],
        '--------------- MENU PRINCIPAL --------------~n', []),
    ansi_format([fg(green)], '  [1] ', []),
    writeln('Analizar mi planta'),
    ansi_format([fg(green)], '  [2] ', []),
    writeln('Consultar informacion'),
    ansi_format([fg(green)], '  [3] ', []),
    writeln('Consultar historial'),
    ansi_format([fg(green)], '  [4] ', []),
    writeln('Ver sintoma mas frecuente'),
    ansi_format([fg(green)], '  [5] ', []),
    writeln('Limpiar datos de la consulta'),
    ansi_format([fg(green)], '  [6] ', []),
    writeln('Salir del sistema'),
    ansi_format([bold, fg(cyan)],
        '----------------------------------------------~n', []),
    preguntar_opcion('Selecciona una opcion: ', 1, 6, Opcion),
    ejecutar(Opcion).


ejecutar(1) :-
    consulta,
    pausa,
    menu.
ejecutar(2) :-
     informacion,
     pausa,
    menu.
ejecutar(3) :-
    listar_registros,
    pausa,
    menu.
ejecutar(4) :-
    mostrar_estadisticas_consola,
    pausa,
    menu.
ejecutar(5) :-
    limpiar_datos,
     ansi_format([bold, fg(yellow)],
        '~nLos datos de la consulta fueron limpiados.~n', []),
    pausa,
    menu.
ejecutar(6) :-
    limpiar_datos,
    nl,
    ansi_format([bold, fg(green)],
        'Gracias por utilizar PlantCare. Hasta pronto!~n', []).

% PAUSA PARA LEER LOS RESULTADOS
pausa :-
    nl,
    write('Presiona ENTER para continuar...'),
    read_line_to_string(user_input, _).

   % REALIZAR UNA CONSULTA
consulta :-
     limpiar_datos,
     nl,
      writeln('--- ANALISIS DE TU PLANTA ---'),
    capturar_datos,
    analizar.
% CAPTURAR LOS DATOS
capturar_datos :-
    nl,
     writeln('Selecciona el sintoma principal:'),
    writeln('1. Hojas amarillas'),
    writeln('2. Hojas marchitas'),
    writeln('3. Crecimiento lento'),
    writeln('4. Manchas u otro sintoma'),
    writeln('5. Sin sintomas visibles'),
    writeln('6. No lo se'),
    preguntar_opcion('Opcion: ', 1, 6, S),
    guardar_sintoma(S),

    nl,
    writeln('Como esta la humedad del suelo?'),
    writeln('1. Baja'),
    writeln('2. Adecuada'),
    writeln('3. Alta'),
    writeln('4. No lo se'),
    preguntar_opcion('Opcion: ', 1, 4, H),
    guardar_humedad(H),

    nl,
    writeln('Como es la iluminacion?'),
    writeln('1. Baja'),
    writeln('2. Adecuada'),
    writeln('3. Alta'),
    writeln('4. No lo se'),
    preguntar_opcion('Opcion: ', 1, 4, L),
    guardar_iluminacion(L),

    nl,
    writeln('Con que frecuencia riegas la planta?'),
    writeln('1. Frecuentemente'),
    writeln('2. Moderadamente'),
    writeln('3. Poco frecuente'),
    writeln('4. No lo se'),
    preguntar_opcion('Opcion: ', 1, 4, R),
    guardar_riego(R).

%validar las opciones del usuario
preguntar_opcion(Pregunta, Min, Max, Opcion) :-
    write(Pregunta),
    read_line_to_string(user_input, Linea),
    (   number_string(Numero, Linea),
        integer(Numero),
        Numero >= Min,
        Numero =< Max
    ->  Opcion = Numero
    ;   writeln('Opcion no valida. Intenta nuevamente.'),
        preguntar_opcion(Pregunta, Min, Max, Opcion)
    ).

% GUARDAR EL SINTOMA
guardar_sintoma(1) :- assertz(sintoma(hojas_amarillas)).
guardar_sintoma(2) :- assertz(sintoma(hojas_marchitas)).
guardar_sintoma(3) :- assertz(sintoma(crecimiento_lento)).
guardar_sintoma(4) :- assertz(sintoma(otro_sintoma)).
guardar_sintoma(5) :- assertz(sintoma(sin_sintomas)).
guardar_sintoma(6) :- assertz(sintoma(no_se)).

% GUARDAR LA HUMEDAD
guardar_humedad(1) :- assertz(humedad(baja)).
guardar_humedad(2) :- assertz(humedad(adecuada)).
guardar_humedad(3) :- assertz(humedad(alta)).
guardar_humedad(4) :- assertz(humedad(no_se)).

% GUARDAR LA ILUMINACION
guardar_iluminacion(1) :- assertz(iluminacion(baja)).
guardar_iluminacion(2) :- assertz(iluminacion(adecuada)).
guardar_iluminacion(3) :- assertz(iluminacion(alta)).
guardar_iluminacion(4) :- assertz(iluminacion(no_se)).

% GUARDAR LA FRECUENCIA DE RIEGO
guardar_riego(1) :- assertz(riego(frecuente)).
guardar_riego(2) :- assertz(riego(moderado)).
guardar_riego(3) :- assertz(riego(poco_frecuente)).
guardar_riego(4) :- assertz(riego(no_se)).

% MOTOR DE INFERENCIA
analizar :-
    nl,
    writeln('Analizando las condiciones de la planta...'),
    (   recomendacion(Regla, Problema, Consejo, Explicacion)
    ->  mostrar_resultado(Regla, Problema, Consejo, Explicacion)
    ;   datos_incompletos
    ->  writeln('No hay informacion suficiente.'),
        writeln('Revisa los datos desconocidos e intenta nuevamente.')
    ;   writeln('No existe una regla aplicable a esta situacion.'),
        writeln('Consulta a una persona especializada si el problema continua.')
    ).
% COMPROBAR SI FALTAN DATOS
datos_incompletos :-
    sintoma(no_se);
    humedad(no_se);
    iluminacion(no_se);
    riego(no_se).
% MODULO DE EXPLICACION
mostrar_resultado(Regla, Problema, Consejo, Explicacion) :-
    nl,
    writeln('======================================'),
    writeln('         RESULTADOS'),
    writeln('======================================'),
    format('Posible problema: ~w~n', [Problema]),
    format('Regla aplicada: ~w~n', [Regla]),
    format('Explicacion: ~w~n', [Explicacion]),
    format('Recomendacion: ~w~n', [Consejo]),
    writeln('======================================'),
    guardar_registro(Problema).


% INFORMACION DEL SISTEMA
informacion :-
    nl,
    writeln('PlantCare analiza cuatro variables:'),
    writeln('- Sintomas de la planta.'),
    writeln('- Humedad del suelo.'),
    writeln('- Iluminacion.'),
    writeln('- Frecuencia de riego.'),
    writeln('Las recomendaciones son orientativas.').

% LIMPIAR LOS DATOS DE LA CONSULTA
limpiar_datos :-
    retractall(sintoma(_)),
    retractall(humedad(_)),
    retractall(iluminacion(_)),
    retractall(riego(_)).

% GUARDAR CONSULTA EN LA BASE DE DATOS
guardar_registro(Problema) :-
    get_time(Tiempo),
    stamp_date_time(Tiempo, FechaHora, local),
    format_time(string(Fecha), '%Y-%m-%d %H:%M:%S', FechaHora),

    aggregate_all(count,
        registro(_, _, _, _, _, _, _),
        Cantidad),
    Id is Cantidad + 1,

    sintoma(Sintoma),
    humedad(Humedad),
    iluminacion(Iluminacion),
    riego(Riego),

    Registro = registro(
        Id, Fecha, Sintoma, Humedad,
        Iluminacion, Riego, Problema
    ),

    Ruta = 'datos_plantcare.pl',

    open(Ruta, append, Archivo),
    write_term(Archivo, Registro, [quoted(true)]),
    write(Archivo, '.'),
    nl(Archivo),
    close(Archivo),

    assertz(Registro),
    writeln('Consulta guardada correctamente.').



% CONSULTAR TODOS LOS REGISTROS
listar_registros :-
    nl,
    writeln('===== HISTORIAL DE PLANTCARE ====='),
    findall(
        registro(Id, Fecha, Sintoma, Humedad, Iluminacion, Riego, Problema),
        registro(Id, Fecha, Sintoma, Humedad, Iluminacion, Riego, Problema),
        Registros
    ),
    ( Registros = []
    ->
        writeln('Todavia no hay consultas guardadas.')
    ;
        mostrar_registros(Registros)
    ).

% MOSTRAR CADA REGISTRO
mostrar_registros([]).

mostrar_registros([
    registro(Id, Fecha, Sintoma, Humedad, Iluminacion, Riego, Problema)
    | Resto
]) :-
    format('Consulta: ~w~n', [Id]),
    format('Fecha: ~w~n', [Fecha]),
    format('Sintoma: ~w~n', [Sintoma]),
    format('Humedad: ~w~n', [Humedad]),
    format('Iluminacion: ~w~n', [Iluminacion]),
    format('Riego: ~w~n', [Riego]),
    format('Resultado: ~w~n', [Problema]),
    writeln('--------------------------------'),
    mostrar_registros(Resto).

% =========================================================
% ESTADISTICAS: SINTOMA MAS FRECUENTE (MODO CONSOLA)
% =========================================================

mostrar_estadisticas_consola :-
    nl,
    writeln('======================================'),
    writeln('       REPORTE ESTADISTICO           '),
    writeln('======================================'),
    findall(Sintoma, registro(_, _, Sintoma, _, _, _, _), ListaSintomas),
    (   ListaSintomas \== [] ->
        list_to_set(ListaSintomas, SintomasUnicos),
        mapear_frecuencias(SintomasUnicos, ListaSintomas, ParesFrecuencia),
        max_member(MaxCount-SintomaTop, ParesFrecuencia),
        format('El sintoma mas frecuente es:~n-> "~w"~nCon un total de ~w registro(s).~n', [SintomaTop, MaxCount])
    ;   writeln('Aun no hay registros guardados en el historial.')
    ),
    writeln('======================================').

% Funciones auxiliares para calcular frecuencias
mapear_frecuencias([], _, []).
mapear_frecuencias([S|RestoUnicos], ListaTotal, [Count-S | RestoPares]) :-
    contar_ocurrencias(S, ListaTotal, Count),
    mapear_frecuencias(RestoUnicos, ListaTotal, RestoPares).

contar_ocurrencias(_, [], 0).
contar_ocurrencias(X, [X|T], N) :- !,
    contar_ocurrencias(X, T, N1),
    N is N1 + 1.
contar_ocurrencias(X, [_|T], N) :-
    contar_ocurrencias(X, T, N).
