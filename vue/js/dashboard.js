fetch('/auth/dashboard')
    .then(response => {
        // Obtenir le header "admin" de la réponse
        const userType = response.headers.get('userType');

        // Faire ce que vous souhaitez avec la valeur "isAdmin"
        console.log('userType:', userType);
    });

fetch('/auth/dashboard/get_info', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}).then(res => res.json())
    .then(res => {
        console.log(res)

    })