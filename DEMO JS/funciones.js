

function sumaTres(x) {
    console.log(x + 3)
}

function sumaTresReturn(x) {
    return x + 3
}

sumaTres(5)

console.log(sumaTresReturn(5))


//Almacenar variables dentro de funciones

//Esto a continuación es anticuado
var sumaTres = function sumaTres(x) {
    return x + 3
}

var sumaTres = function(x) {
    return x + 3
}

//Funciones flecha, más modernas
var sumaTres = (x) => {
    return x + 3
}