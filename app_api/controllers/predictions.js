const axios = require('axios');
var qs = require('qs');

async function createPrediction(req, res){
    const { local_type, building_area, land_area, total_room, street_type,  street_name,  postal_code } = req.body;

    const features = {
        local_type, building_area, land_area, total_room, street_type,  street_name,  postal_code
    };

    const data = qs.stringify({
    "grant_type": "client_credentials",
    "client_id": process.env.CLIENT_ID,
    "client_secret": process.env.CLIENT_SECRET,
    });

    const { data: token } = await axios.post(`${process.env.TOKEN_URL}`, data)
    const { access_token } = token;

    const config = {
        headers: { Authorization: `Bearer ${access_token}` }
    };

    const bodyParameters = [
    { "name": "local_type", "value": local_type},
    { "name": "building_area", "value": parseInt(building_area, 10)},
    { "name": "land_area", "value": parseInt(land_area, 10)},
    { "name": "total_room", "value": parseInt(total_room, 10)},
    { "name": "street_type", "value": street_type},
    { "name": "street_name", "value": street_name},
    { "name": "postal_code", "value": parseInt(postal_code, 10)}]

    const predictionResult = await axios.post(`${process.env.PREDICTION_URL}`, bodyParameters, config)

    const predResponse = predictionResult.data.response.predictions.pred_value;

    const prediction = true;

    var n = new Number(predResponse);
    var myObj = {
      style: "currency",
      currency: "EUR"
    }
    
    const price = n.toLocaleString("fr-FR", myObj);

    const confidence = 80;

    const { freeTrial } = req.user;
    const isConnected = true;

    res.render('pages/account', { isConnected, freeTrial, prediction, price, confidence, features  });
}

module.exports = {
    createPrediction,
}