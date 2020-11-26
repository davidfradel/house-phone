async function createPrediction(req, res){
    console.log('req.body--------', req.body)
    const { local_type, building_area, land_area, total_room, street_type,  street_name,  postal_code } = req.body;

    const features = {
        local_type, building_area, land_area, total_room, street_type,  street_name,  postal_code
    };
    const confidence = true;
    const explain = true;




    res.render('pages/account', { freeTrial: true });
}

module.exports = {
    createPrediction,
}