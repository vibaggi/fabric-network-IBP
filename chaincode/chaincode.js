/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const helper = require('./helper-chaincode')

let Chaincode = class {

    // The Init method is called when the Smart Contract 'fabcar' is instantiated by the blockchain network
    // Best practice is to have any Ledger initialization in separate function -- see initLedger()
    async Init(stub) {
        console.info('=========== Instantiated fabric-api chaincode ===========');
        return shim.success();
    }

    // The Invoke method is called as a result of an application request to run the Smart Contract
    // 'fabcar'. The calling application program has also specified the particular smart contract
    // function to be called, with arguments
    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];
        if (!method) {
            console.error('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    async createGame(stub, args) {

        var certificateOwner = helper.getCertificateUser(stub)
        console.log("%%%%%%%",certificateOwner)

        var game = {
            owner: certificateOwner,
            name: args[1],
            dataFab: args[2],
            status: 'CREATED',
            value: args[3],
            description: args[4]
        }

        await stub.putState(args[1], Buffer.from(JSON.stringify(game)));
        return Buffer.from(JSON.stringify(game));
    }
    
    async queryGame(stub, args) {
        var result = await stub.getState(args[0])

        return result
    }

    async receiveFromIndustry(stub, args) {

        
        //recuperando game na rede
        var result = await stub.getState(args[0])

        if (!result || result.length === 0) {
            throw new Error(`O car da ${args[0]} não existe, logo não é possível alterar o seu owner`);
        }

         //analisa uma string JSON, construindo o valor ou um objeto JavaScript descrito pela string, que no caso é o resultado da busca pelo asset. 
         const game = JSON.parse(result.toString());

        if(game.status !== 'CREATED') {
            throw new Error("Apenas jogos recem criados podem ir ao mercado.")
        }
        
       //Vamos validar a organizacao do certificado! Apenas o mercado pode realizar a transação




        //Vamos verificar se o certificado pertence ao owner da wallet!
        // var certificateOwner = helper.getCertificateUser(stub)
        // console.log(car.owner,"-", certificateOwner)
        // if(car.owner.indexOf(certificateOwner) ) return Buffer.from("Transferência não permitida! Apenas cars do owner da wallet podem ser transferidos!")
        

        // //verifica se o nome do novo owner é o mesmo que o nome do owner
        // //antigo. Se for, significa que vc está tentando transferir o car
        // //para o mesmo owner, o que não deve ser permitido
        
        // if (car.owner == args[1]) {
        //     return Buffer.from("Não é possivel transferir car para o mesmo owner")
        // }

        // //atualizando o campo "owner" do objeto car para o nome do novo owner
        // car.owner = args[1]

        //atualizando o asset car na blockchain
        await stub.putState(args[0], Buffer.from(JSON.stringify(car)));


        return Buffer.from("Sucesso")


    }

    // async queryAllCars(stub, args){

    //     let startKey = 'AAA-0000';
    //     let endKey = 'ZZZ-9999';
        
    //     let iterator = await stub.getStateByRange(startKey, endKey);

    //     let allResults = [];
    //     while (true) {
    //       let res = await iterator.next();
    
    //       if (res.value && res.value.value.toString()) {
    //         let jsonRes = {};
    //         console.log(res.value.value.toString('utf8'));
    
    //         jsonRes.Key = res.value.key;
    //         try {
    //           jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
    //         } catch (err) {
    //           console.log(err);
    //           jsonRes.Record = res.value.value.toString('utf8');
    //         }
    //         allResults.push(jsonRes);
    //       }
    //       if (res.done) {
    //         console.log('end of data');
    //         await iterator.close();
    //         console.info(allResults);
    //         return Buffer.from(JSON.stringify(allResults));
    //       }
    //     }
    // }

    async queryHistory(stub, args) {

        var result = await stub.getHistoryForKey(args[0])
        let orderTrack = await helper.getAllResults(result, true);

        return Buffer.from(JSON.stringify(orderTrack))
    }
    
};


shim.start(new Chaincode());

