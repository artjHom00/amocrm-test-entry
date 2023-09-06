const Axios = require('axios');

// Set config defaults when creating the instance
const axios = Axios.create({
    baseURL: `https://${process.env.SUBDOMAIN}.amocrm.ru`
})
  
async function getOrRefreshAccessToken() {
    try {

        let payload = {
            client_id: process.env.AMOCRM_ID,
            client_secret: process.env.AMOCRM_SECRET_KEY,
            grant_type: 'authorization_code',
            redirect_uri: 'https://artemgasparyan.com:3000',
            // & also code // refresh_token
        }

        // if there's refresh token && access token expired
        if(process.env.REFRESH_TOKEN) {
            if((process.env.EXPIRES_AT && new Date().getTime() >= new Date(process.env.EXPIRES_AT).getTime())) {
                payload['refresh_token'] = process.env.REFRESH_TOKEN
            }
            // else if there's refresh token, but it's not expired yet - just return
            return true;
        } else {
            payload['code'] = process.env.AMOCRM_AUTH_KEY
        }

        const response = await axios.post('/oauth2/access_token', payload);
        
        // update data in .env file
        process.env.ACCESS_TOKEN = response.data.access_token
        process.env.REFRESH_TOKEN = response.data.refresh_token
        process.env.EXPIRES_AT = Date.now() + (response.data.expires_in*1000) // transforming expires_in to milliseconds & calculating when to refresh token

        return true

    } catch(e) {
        throw e.response.data
    }
}

// Функция для поиска контакта по email и/или телефону
async function findContactByEmailOrPhone(email, phone) {

    try {
        await getOrRefreshAccessToken().catch(e => {
            console.group()

            console.log('[/providers/amocrm.js] error occured while getting / refreshing tokens on findContactByEmailOrPhone. payload: ')
            console.log(e)
    
            console.groupEnd()
        });

        const response = await axios.get('/api/v4/contacts', {
            headers: {
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
            },
            params: {
                filter: {
                    or: [
                      { custom_fields: { field_id: 1480553, values: [{ value: phone }] } }, // Replace with the actual custom field ID for phone
                      { custom_fields: { field_id: 1480555, values: [{ value: email }] } }, // Replace with the actual custom field ID for email
                    ],
              },
            },
        }).catch(e => {
            throw e.response.data
        });

        if (response.data._embedded && response.data._embedded?.contacts?.length > 0) {
          return response.data._embedded.contacts[0];
        }
      
        return null;
    
    } catch(e) {
        throw e
    }

}

async function createContact(name, email, phone) {
    try {

        await getOrRefreshAccessToken().catch(e => {
            console.group()

            console.log('[/providers/amocrm.js] error occured while getting / refreshing tokens on findContactByEmailOrPhone. payload: ')
            console.log(e)
    
            console.groupEnd()
        }).catch(e => {
            throw e.response.data
        });

        
        const response = await axios.post(`/api/v4/contacts`, JSON.stringify([{
            name: name,
            custom_fields_values: [
            {
                field_id: 1480553,
                values: [{ value: phone }],
            },
            {
                field_id: 1480555,
                values: [{ value: email }],
            },
            ],
        }]), {
            headers: {
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
            },
        }).catch(e => {
            throw e.response.data
        });

        
        if (response.data._embedded && response.data._embedded?.contacts?.length > 0) {
            return response.data._embedded.contacts[0];
        }

        throw 'Contact not updated'
      
    } catch(e) {
        throw e
    }
}

async function updateContact(contactId, name, email, phone) {
    try {

        await getOrRefreshAccessToken().catch(e => {
            console.group()

            console.log('[/providers/amocrm.js] error occured while getting / refreshing tokens on findContactByEmailOrPhone. payload: ')
            console.log(e)
    
            console.groupEnd()
        });

        const response = await axios.patch(`/api/v4/contacts/${contactId}`, {
            name: name,
            custom_fields_values: [
            {
                    field_id: 1480553,
                    values: [{ value: phone }],
                },
                {
                    field_id: 1480555,
                    values: [{ value: email }],
                },
                ],
            }, { 
            headers: {
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
            },
        }).catch(e => {
            throw e.response.data
        });

        return response.data;

    } catch(e) {
        throw e
    }
}

// Функция для создания сделки
async function createDeal(contactId) {
    try {

        await getOrRefreshAccessToken().catch(e => {
            console.group()

            console.log('[/providers/amocrm.js] error occured while getting / refreshing tokens on findContactByEmailOrPhone. payload: ')
            console.log(e)
    
            console.groupEnd()
        });

        const response = await axios.post(`/api/v4/leads`, {
            _embedded: {
                contacts: [
                    {
                        id: Number(contactId)
                    }
                ]
            }
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
            },
        }).catch(e => {
            throw e.response.data
        });

        return response.data;
    } catch(e) {
        throw e
    }
}

(async () => {
    
    try {
        
        // getting access & refresh tokens from auth_key on start of the app
        await getOrRefreshAccessToken().catch(e => {
            throw e
        })
        
        console.log('[/providers/amocrm.js] access & refresh tokens successfully extracted!')
        
    } catch (e) {
        console.group()
        
        console.log('[/providers/amocrm.js] error occured while getting access & refresh tokens on app init. payload: ')
        console.log(e)
        
        console.groupEnd()
        return
    }

})()

module.exports = {
    getOrRefreshAccessToken,
    findContactByEmailOrPhone,
    createContact,
    updateContact,
    createDeal
}