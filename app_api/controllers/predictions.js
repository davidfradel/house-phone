async function createPrediction(req, res){
    const { local_type, building_area, land_area, total_room, street_type,  street_name,  postal_code } = req.body;

    const features = {
        local_type, building_area, land_area, total_room, street_type,  street_name,  postal_code
    };
    // const confidence = true;
    // const explain = true;

    const prediction = true;

    var n = new Number(126000);
    var myObj = {
      style: "currency",
      currency: "EUR"
    }
    
    const price = n.toLocaleString("fr-FR", myObj);

    const confidence = 40;
    const featureImportance = {
        local_type: 10,
        total_room: 23,
        street_name: -34,
    };

    const { freeTrial } = req.user;
    const isConnected = true;

    res.render('pages/account', { isConnected, freeTrial, prediction, price, confidence, featureImportance, features  });
}

module.exports = {
    createPrediction,
}