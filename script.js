let userInfo;

// Initialisation de l'authentification Google
function initGoogleAuth() {
    google.accounts.id.initialize({
        client_id: "411737484438-ooj7ggossuv6g8lrttgjofktimjakgrs.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: true,
        ux_mode: "popup",
        context: "signin"
    });
    
    google.accounts.id.renderButton(
        document.getElementById("googleSignInBtn"),
        {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left"
        }
    );
    
    google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("Google One Tap prompt skipped");
        }
    });
}

// Gestion de la réponse d'authentification
function handleCredentialResponse(response) {
    document.getElementById('emailLoader').style.display = 'flex';
    
    try {
        const token = response.credential;
        userInfo = parseJwt(token);
        
        if (!isValidStudentEmail(userInfo.email)) {
            showError("Seuls les emails étudiants ULC-ICAM sont autorisés");
            return;
        }
        
        document.getElementById('studentEmail').value = userInfo.email;
        document.querySelector('.email-row').style.display = 'flex';
        document.getElementById('googleSignInBtn').style.display = 'none';
        document.getElementById('emailLoader').style.display = 'none';
        
    } catch (error) {
        console.error("Error handling credential response:", error);
        showError("Erreur lors de l'authentification");
    }
}

// Validation du JWT
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Validation de l'email étudiant
function isValidStudentEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@\d{4}\.(ulc-icam\.com|icam\.fr)$/;
    return emailRegex.test(email);
}

// Affichage des erreurs
function showError(message) {
    // const errorElement = document.createElement('div');
    // errorElement.className = 'auth-error';
    // errorElement.textContent = message;
    // document.querySelector('.connect-btn').appendChild(errorElement);
    
    // setTimeout(() => {
    //     google.accounts.id.cancel();
    //     errorElement.remove();
    //     document.getElementById('emailLoader').style.display = 'none';
    // }, 5000);
    document.getElementById('emailLoader').style.display = 'none';
    alert(message);
}

// Soumission du formulaire
document.getElementById('voteForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('studentEmail').value;
    const candidate = document.getElementById('candidate').value;
    
    if (!isValidStudentEmail(email)) {
        alert('Veuillez vous connecter avec votre email étudiant');
        return;
    }

    if (!candidate) {
        alert('Veuillez sélectionner un candidat');
        return;
    }

    sendVote(userInfo, candidate);
});

// Envoi du vote au serveur
async function sendVote(userInfo, candidate) {
    const webhookURL = "https://analystic.app.n8n.cloud/webhook/921dbf3d-1762-4f59-92ce-97f13f07674c";
    const loaderOverlay = document.getElementById('formLoader');

    try {
        loaderOverlay.style.display = "flex";

        const response = await fetch(webhookURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: userInfo,
                candidate: candidate
            })
        });

        const data = await response.json();
        showConfirmation(data);

    } catch (error) {
        console.error("Error sending vote:", error);
        document.getElementById('confirmation').innerHTML = `
            <h2>❌ Erreur</h2>
            <p>Une erreur est survenue lors de l'envoi de votre vote.</p>
            <p>Veuillez réessayer plus tard.</p>`;
    } finally {
        loaderOverlay.style.display = "none";
        document.getElementById('voteForm').style.display = 'none';
        document.getElementById('confirmation').classList.add('show');
    }
}

// Affichage de la confirmation
function showConfirmation(data) {
    const confirmation = document.getElementById('confirmation');
    
    if (data.success && !data.error) {
        confirmation.innerHTML = `
            <h2>✅ Merci pour votre vote !</h2>
            <p>Votre participation a été enregistrée avec succès.</p>`;
        document.getElementById('voteForm').style.display = 'none';
        document.querySelector('.form-info').style.display = 'none';
    } 
    else if (data.error) {
        confirmation.innerHTML = `
            <h2>❌ Accès non autorisé</h2>
            <p>Votre adresse e-mail n'est pas reconnue comme une adresse étudiante valide.</p>`;
    }
    else {
        confirmation.innerHTML = `
            <h2>📌 Vote déjà enregistré</h2>
            <p>Notre système indique que vous avez déjà participé au vote.</p>
            <p>Un seul vote est autorisé par étudiant.</p>`;
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Réinitialisation au clic sur l'icône de rechargement
    document.getElementById('reloadIcon').addEventListener('click', function() {
        document.getElementById('studentEmail').value = '';
        document.querySelector('.email-row').style.display = 'none';
        document.getElementById('googleSignInBtn').style.display = 'block';
    });
    
    // Initialisation de l'authentification Google
    if (typeof google !== 'undefined') {
        initGoogleAuth();
    } else {
        console.error("Google Identity Services library not loaded");
    }
});