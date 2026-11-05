:- consult('plantcare.pl').
% Ejecutar las pruebas escribiendo: pruebas.
pruebas :-
    probar(r1, hojas_marchitas, baja,
           adecuada, poco_frecuente),
    probar(r2, hojas_marchitas, alta,
           adecuada, frecuente),
    probar(r3, hojas_amarillas, alta,
           adecuada, frecuente),
    probar(r5, crecimiento_lento, adecuada,
           baja, moderado),
    probar(r9, sin_sintomas, adecuada,
           adecuada, moderado).
probar(ReglaEsperada, Sintoma, Humedad,
      Luz, Riego) :-

    limpiar_datos,
    assertz(sintoma(Sintoma)),
    assertz(humedad(Humedad)),
    assertz(iluminacion(Luz)),
    assertz(riego(Riego)),
    (   recomendacion(ReglaEsperada, _, _, _)
    ->  format('Prueba ~w: CORRECTA~n',
               [ReglaEsperada])
    ;   format('Prueba ~w: INCORRECTA~n',
               [ReglaEsperada])
    ).
% Limpiar los hechos al terminar
probar_fin :-
    limpiar_datos.


