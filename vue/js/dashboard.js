fetch('/auth/dashboard')
    .then(response => {
        // Obtenir le header "admin" de la réponse
        const userType = response.headers.get('userType');

        // Faire ce que vous souhaitez avec la valeur "isAdmin"
        console.log('userType:', userType);
    });
