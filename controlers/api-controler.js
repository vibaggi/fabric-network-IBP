
var networkService = require('./../services/network-service')


function createUser(userName) {

    return new Promise(async (resolve, reject) => {

        var username = userName.toLowerCase()
        console.log(username)
        networkService.createWallet(username).then(resp => resolve({ resp: resp })).catch(error => reject(error))


    })


}

function getAllUsersName() {
    return new Promise(async (resolve, reject) => {

        var list = await networkService.getAllWallets()
        resolve(list.map(user => { return user.label }))
    })
}
function confirmUsersName(userName) {
    return new Promise(async (resolve, reject) => {

        var users = await getAllUsersName()
        var confirmation = false
        console.log(userName)
        users.forEach(item => {
            if (JSON.stringify(item) === JSON.stringify(userName)) {
                confirmation = true
            }
        })

        resolve(confirmation)



    })
}


/**
 * Método prepara a requisicao do front-end para chamar a transação no fabric
 * @param {JSON} carro 
 * @param {*} username 
 */
function createCar(carro, username) {

    return new Promise(async (resolve, reject) => {
        //inicialmente passaremos a key, entretanto deverá haver um sistema automatica de gerar Key
        // var args = Array.prototype.slice.call([ ])


        //submetendo transação

        try {
            if (username){
                var contract = await networkService.getGatewayContract(username)
            }
            else throw Error ("Nenhum usuario informado")
            if (carro.urlImage && carro.plate && carro.fabDate && carro.color && carro.name) {

                var resp = await contract.submitTransaction("createCar", carro.urlImage, carro.plate, carro.fabDate, carro.color, carro.name)

                resolve(JSON.parse(resp))
            }
            else {
                throw Error ("Falta um dos argumentos")
                
            }
        } catch (error) {
            reject(error)
        }

        // networkService.getGatewayContract(username).then(contract => {

        //     contract.submitTransaction("createCarro", carro.key, carro.dono, carro.placa, carro.anoDeFab, carro.cor, carro.nome).then(resp=>{
        //         resolve("ok")
        //     }).catch(error=>{
        //         reject(error)
        //     })

        // }).catch(error => {
        //     reject(error)
        // })
    })


}

/**
 * Método para realizar a transação de tradeCar no chaincode.
 * @param {*} carroKey 
 * @param {*} newOwner 
 * @param {*} username é o identificador da wallet
 */
function tradeCar(plate, newOwner, username) {

    return new Promise(async (resolve, reject) => {

        try {

            var contract = await networkService.getGatewayContract(username);
            var resp = await contract.submitTransaction("tradeCar", plate, newOwner);

            resolve({ resp: resp })

        } catch (error) {
            reject(error)
        }



    })

}

/**
 * Pesquisa um carro específico pela sua chave
 * @param {string} carroKey 
 * @param {string} username 
 */
function getCar(carroKey, username) {

    return new Promise(async (resolve, reject) => {
        try {

            var contract = await networkService.getGatewayContract(username);
            var carro = await contract.evaluateTransaction("queryCar", carroKey)

            resolve(JSON.parse(carro))
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Retorna a lista de todos os carros.
 * @param {string} username o nome da wallet que será usada no rest-api
 */
function getAllCars(username) {

    return new Promise(async (resolve, reject) => {
        try {

            var contract = await networkService.getGatewayContract(username);
            var carros = await contract.evaluateTransaction("queryAllCars")
            carros = JSON.parse(carros)
            console.log(carros)
            let result = []

            carros.forEach(element => {
                console.log(element)
                let obj = {
                    "fabDate": element.Record.fabDate,
                    "color": element.Record.color,
                    "owner": element.Record.owner,
                    "name": element.Record.name,
                    "plate": element.Record.plate,
                    "urlImage": element.Record.urlImage
                }
                result.push(obj)

            });


            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 
 * @param {*} userName 
 */
function getAllCarsByOwner(userName) {
    return new Promise(async (resolve, reject) => {
        let allCars = await getAllCars(userName)

        let car = allCars.filter(item => {
            if (item.owner == userName) return item
        })

        resolve(car)

    })
}

function getHistoryById(carId, username) {

    return new Promise(async (resolve, reject) => {
        try {

            var contract = await networkService.getGatewayContract(username);
            var carro = await contract.evaluateTransaction("queryHistory", carId)
            console.log(carro)

            resolve(JSON.parse(carro))
        } catch (error) {
            reject(error)
        }
    })
}


module.exports = {
    createUser: createUser,
    createCar: createCar,
    tradeCar: tradeCar,
    getCar: getCar,
    getAllCars: getAllCars,
    getHistoryById: getHistoryById,
    getAllCarsByOwner: getAllCarsByOwner,
    getAllUsersName: getAllUsersName,
    confirmUsersName: confirmUsersName
}