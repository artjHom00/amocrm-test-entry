let { findContactByEmailOrPhone, createContact, updateContact, createDeal } = require('../providers/amocrm')


let findOrCreateContactAndCreateDeal = async (req, res) => {
    try {

        let { name, email, phone } = req.query

        if(!name || !email || !phone) {
            return res.status(400).send('Один из обязательных параметров не указан: name, email, phone')
        }

        var contact = await findContactByEmailOrPhone(email, phone)
        console.log("🚀 ~ file: apiController.js:14 ~ findOrCreateContactAndCreateDeal ~ contact:", contact)
        
        console.log('[contact]', contact?.id)

        if(!contact) {
            contact = await createContact(name, email, phone)            
            console.log('[success] contact created')
        } else {
            await updateContact(contact.id, name, email, phone)
            console.log('[success] contact updated')
        }

        await createDeal(contact.id)
        console.log('[success] deal created')
        return res.sendStatus(200)

    } catch(e) {
        console.log("🚀 ~ file: apiController.js:29 ~ findOrCreateContactAndCreateDeal ~ e:", e)
        return res.status(500).send(e)
    }
}

module.exports = { 
    findOrCreateContactAndCreateDeal,
}