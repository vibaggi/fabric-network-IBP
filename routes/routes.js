
var router      = require('express').Router();
var controller  = require('../controlers/api-controler')

/**
 * Cria uma wallet para o usuário caso não exista.
 */

router.post("/createUser", function(req, res){
    controller.createUser(req.body.userName).then(resp=>{
        res.send((resp))
    }).catch(error=>{
        res.status(500).send(error)
    })
})

router.get("/getAllUsers", function(req, res){
    controller.getAllUsersName().then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })
})

router.get("/confirmUser/:userName", function(req, res){
    controller.confirmUsersName(req.params.userName).then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })
})

/**
 * Cria um carro. É necessário informar o usuário que irá realizar a ação
 */
router.post("/createCar", function(req, res){
    //verificando body recebido
   if(req.body.car == undefined){
    res.status(500).send("Create car :: Erro :: Objeto car não enviado pelo body")
   }

   controller.createCar(req.body.car, req.body.userName).then(resp=>{
       res.send(resp)
   }).catch(error=>{
       res.status(500).send(error)
   })
})

/**
 * Faz um trade de um carro entre proprietários
 */
router.post("/tradeCar", function(req, res){

    if(req.body.userName == undefined) res.status(401).send("Trade car :: Erro :: Não authorizado. Identifique-se! Passe userName no parametro")

    if(req.body.plate == undefined || req.body.newOwner == undefined){
        res.status(500).send("Informe os parametros key e newOwner")
    }

    controller.tradeCar(req.body.plate, req.body.newOwner, req.body.userName).then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })

})

//Recupera um carro pelo ID
router.get("/getCar/:userName/:key", function(req, res){
    if(req.params.userName == undefined) res.status(401).send("Não authorizado. Identifique-se! Passe userName no parametro")

    controller.getCar(req.params.key, req.params.userName).then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })

})

//Recupera todos os carros
router.get("/getAllCars/:userName", function(req, res){
    if(req.params.userName == undefined) res.status(401).send("Não authorizado. Identifique-se! Passe userName no parametro")

    controller.getAllCars(req.params.userName).then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })
})

//Recupera todos os carros por owner
router.get("/getAllCarsByOwner/:userName", function(req, res){
    if(req.params.userName == undefined) res.status(401).send("Não authorizado. Identifique-se! Passe userName no parametro")

    controller.getAllCarsByOwner(req.params.userName).then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })
})


// pega historico de transacoes de um carro
router.get("/getHistory/:userName/:key", function(req, res){
    if(req.params.userName == undefined) res.status(401).send("Não authorizado. Identifique-se! Passe userName no parametro")

    controller.getHistoryById(req.params.key, req.params.userName).then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })
})


module.exports = router;