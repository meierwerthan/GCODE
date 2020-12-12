const axios = require('axios');
const cheerio = require('cheerio');

const getResults = async () => {
    try {
        const { data } = await axios.get(
            'https://www.google.com/search?q=restaurants&oq=restaurants&arllag=39672992,-104973441,46&tbm=lcl&rldimm=3120060152935821930&lqi=CgtyZXN0YXVyYW50c0iJ27qSm6qAgAhaHgoLcmVzdGF1cmFudHMQABgAIgtyZXN0YXVyYW50cw&phdesc=lon5F8mQGnA&ved=2ahUKEwjx9N_gtsPrAhWFcc0KHeo2D_cQvS4wAHoECA0QPQ&rldoc=1&tbs=lrf:!1m4!1u3!2m2!3m1!1e1!1m4!1u5!2m2!5m1!1sgcid_3american_1restaurant!1m4!1u5!2m2!5m1!1sgcid_3japanese_1restaurant!1m4!1u2!2m2!2m1!1e1!1m4!1u1!2m2!1m1!1e1!1m4!1u1!2m2!1m1!1e2!1m4!1u15!2m2!15m1!1sserves_1beer!1m4!1u15!2m2!15m1!1shas_1delivery!1m4!1u15!2m2!15m1!1saccepts_1reservations!1m4!1u15!2m2!15m1!1sserves_1wine!1m4!1u15!2m2!15m1!1sfeels_1romantic!1m4!1u22!2m2!21m1!1e1!1m5!1u15!2m2!15m1!1shas_1takeout!4e2!1m5!1u15!2m2!15m1!1shas_1wheelchair_1accessible_1entrance!4e2!1m5!1u15!2m2!15m1!1swelcomes_1children!4e2!1m5!1u15!2m2!15m1!1shas_1seating_1outdoors!4e2!1m5!1u15!2m2!15m1!1spopular_1with_1tourists!4e2!1m5!1u15!2m2!15m1!1sserves_1vegetarian!4e2!1m5!1u15!2m2!15m1!1shas_1childrens_1menu!4e2!1m5!1u15!2m2!15m1!1sserves_1lunch!4e2!1m5!1u15!2m2!15m1!1sserves_1dinner!4e2!2m1!1e2!2m1!1e5!2m1!1e1!2m1!1e3!3sIAEqAlVT,lf:1,lf_ui:9&rlst=f#rlfi=hd:;si:;mv:[[40.01248264830536,-104.82798996796465],[39.58781746022578,-105.19740525116778],null,[39.800477862172315,-105.01269760956622],11];start:60'
        );
        const $ = cheerio.load(data);
        console.log(data);
    }catch(err){
        console.log(err);
    }
};