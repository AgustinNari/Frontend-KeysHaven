


let users = [
    {firstName: "Martin", lastName: "Gonzalez", age: 21},
    {firstName: "Carlos", lastName: "Martinez", age: 30},
    {firstName: "Marcos", lastName: "Diaz", age: 40},
    {firstName: "Juana", lastName: "Suarez", age: 25},
    {firstName: "Eduardo", lastName: "Vargas", age: 35}
]

//Uso de map()

//Modificar elementos
let modifiedUsers = users.map((user) => {
    return {
        Nombre: user.firstName.toUpperCase(),
        Apellido: user.lastName.toLowerCase()
    }
})


console.table(modifiedUsers)


//Unir valores
//Acá usamos un tipo especial de string llamado template strings, que se usan en formato literal
//Esto nos permite crear cadenas de texto dinámicas
//Estas se indican entre comillas invertidas
let userNames = users.map((user => `Hola ${user.firstName} ${user.lastName}`))

console.log(userNames)


//Agregar valores
let usersWithFullName = users.map((user) => {
    return {
        Nombre: user.firstName,
        Apellido: user.lastName,
        Edad: user.age,
        NombreCompleto: `${user.firstName} ${user.lastName}`
    }
})

console.table(usersWithFullName)



//Eliminar valores
//Usamos operadores lógicos
//Se hace una copia del array original, pero sin la edad
//Se usa el spread operator
let usersWithoutAge = users.map((({age, ...rest}) => rest) )

console.table(usersWithoutAge)



//Convertir datos
let userWithAgeMonths = users.map((user) => {
    return {
        Nombre: user.firstName,
        Apellido: user.lastName,
        Edad: user.age * 12
    }
})

console.table(userWithAgeMonths)




//Usamos filter()
let usersOlderThan30 = users.filter((user) => user.age > 30)

console.table(usersOlderThan30)


//Usamos find()
function findUserByName(usersArray, name) {
    return usersArray.find((user) => user.firstName === name)
}

let usuario = findUserByName(users, "Eduardo")
console.log(usuario)


function findUsersByAge(usersArray, age) {
    return usersArray.filter((user) => user.age === age)
}

let usuarios = findUsersByAge(users, 30)
console.table(usuarios)


//Podemos concatenar estos métodos como se desee
let userWithNameAndAge30 = users
    .filter((user) => user.age === 30)
    .map((user) => {
        return {
            Nombre: user.firstName,
            Apellido: user.lastName
        }
    })

console.table(userWithNameAndAge30)