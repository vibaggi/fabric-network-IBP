//Este service gerencia a wallet e a conectividade com a network

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
var ccp

//criando o file system
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);

var axios = require('axios')


start()


async function start(){
    //Iniciar ao subir a rest-api
    await getConnectionProfile()
    await createIdentity("yuri", "ca-test", "ca-test")
}

/**
 * Função para criar um novo CA no rest api, é necessário usar uma identidade 'resgistrar' como o adm.
 * @param {*} userName 
 */
function createWallet(userName) {

    return new Promise(async (resolve, reject) => {
        
        // Verificando a existencia do usuário
        const userExists = await wallet.exists(userName);
        if (userExists) {
            reject(`Já existe uma wallet para ${userName} `)
        }

        //Verificando se a respApi tem uma conta ADM
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            reject('O resp-api precisa de uma wallet de Administrador')
        }

        //Conectando à rede usando o adm
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        //Criando registro do novo usuário
        const secret = await ca.register({ affiliation: 'org1', enrollmentID: userName, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: userName, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('org1', enrollment.certificate, enrollment.key.toBytes());
        wallet.import(userName, userIdentity);
        console.log("Wallet criado com sucesso!")

        resolve("Sucesso")
    })

}

function getAllWallets(){
    return new Promise( async (resolve, reject)=>{
        const list = await wallet.list()
        console.log(list)
        resolve(list)
    })
   
}

/**
 * Função para criar uma identidade de um CA. Pode-se criar varias identidades diferentes com o mesmo CA
 * caso este esteja liberado para tal.
 */
async function createIdentity(name, enrollmentId, enrollmentSecret){

    try{

        const caURL = ccp.certificateAuthorities['org1-ca'].url;
        const ca = new FabricCAServices(caURL);

        const ident = await wallet.exists(name);
        if (ident) {
            console.log(`An identity for the admin user ${name} already exists in the wallet`);
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: enrollmentId, enrollmentSecret: enrollmentSecret });
        const identity = X509WalletMixin.createIdentity(process.env.IBP_KEY, enrollment.certificate, enrollment.key.toBytes());
        wallet.import(name, identity);
        console.log(`Successfully enrolled admin user ${name} and imported it into the wallet`);
    }catch(error){
        console.log('erro ao criar o adm')
        console.log(error)
    }
}

/**
 * Método para atualizar o connection profile. Busca no Swagger do IBP
 */
async function getConnectionProfile(){

    //preparando url
    var url = process.env.IBP_URL+"/api/v1/networks/"+process.env.IBP_NETWORK_ID+"/connection_profile" 

    //Conseguindo connection profile
    await axios({
        method:'get',
        url: url,
        auth: {
            "username": process.env.IBP_KEY,
            "password": process.env.IBP_SECRET
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
    }).then(resp=>{
        //adicionado connection profile na variavel global
        console.log(resp.data)
        ccp = resp.data
        return
    })


}

/**
 * Método para ganhar um con
 * @param {*} userName Proprietário da wallet
 */
function getGatewayContract(userName){

    return new Promise( async (resolve, reject)=>{
          //Abrindo conexao com a network

        const gateway = new Gateway();

        try{

            // Carregando o connectionProfile
            //let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));
            // let connectionProfile = JSON.parse(fs.readFileSync(ccpPath, 'utf8'))
            let connectionProfile = ccp
            // Configura connectionOptions
            let connectionOptions = {
                identity: userName.toLowerCase(),
                wallet: wallet,
                discovery: { enabled:false, asLocalhost: true }
            };

            console.log(connectionProfile)
            console.log("config prepared")
            await gateway.connect(connectionProfile, connectionOptions);
            console.log("gateway connect")
            const network = await gateway.getNetwork('defaultchannel');
            const contract = await network.getContract('chaincode');
            
            // const response = await contract.submitTransaction.apply(this, args);
            console.log("CONTRACT ----- ")
            console.log(contract)

            resolve(contract)

        }catch(error){
            
            reject(error)

        }
    })
  

}

module.exports = {
    createWallet: createWallet,
    getGatewayContract: getGatewayContract,
    getAllWallets: getAllWallets

}


