const ClientIdentity = require('fabric-shim').ClientIdentity;

class Helper {
    /**
     * In this Class we have some functions to helper chaincode.
     */


     /**
      * Get stub and returns de name of certificate owner.
      * @param {*} stub 
      */
     static getCertificateUser(stub){
        
        let _clientIdentity = new ClientIdentity(stub); 
        let _cert = _clientIdentity.getX509Certificate();
        console.log(_cert)

        if (_cert.subject.commonName){
            return _cert.subject.commonName;
        }
        return null;
     }

     static async getAllResults(iterator, isHistory) {
        console.log("Iniciando Extração")
        let allResults = [];

        console.log("extraindo iterator")
        while (true) {
            let res = await iterator.next();
            console.log(res)
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        console.log(res.value.value.toString('utf8'));
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        console.log(res.value.value.toString('utf8'));
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                await iterator.close();
                console.log('End: getAllResults');
                return allResults;
            }
        }
    }

}

module.exports = Helper