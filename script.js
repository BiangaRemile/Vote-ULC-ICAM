let userInfo;

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function handleCredentialResponse(response) {
    const token = response.credential;
    userInfo = parseJwt(token);

    // Tu peux afficher le nom ou l'email par exemple :
    document.getElementById('studentEmail').value = userInfo.email;
}

document.getElementById('voteForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Validation de l'email
    const email = document.getElementById('studentEmail').value;
    const emailRegex = /^[a-zA-Z0-9._-]+@\d{4}\.(ulc-icam\.com|icam\.fr)$/;

    if (!emailRegex.test(email)) {
        alert('Veuillez sélectionner votre email étudiant valide');
        return;
    }

    // Validation du candidat
    const candidate = document.getElementById('candidate').value;
    if (!candidate) {
        alert('Veuillez sélectionner un candidat');
        return;
    }

    sendVote(userInfo, candidate);

});

const loaderOverlay = document.getElementById('formLoader');

async function sendVote(userInfo, candidate) {
    const webhookURL = "https://analystic.app.n8n.cloud/webhook-test/921dbf3d-1762-4f59-92ce-97f13f07674c";

    try {

        loaderOverlay.style.display = "flex"; // Afficher le loader

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

        if (!response.ok) {
            alert("Erreur d'envoi");
            return
        }

        const data = await response.json(); // lire le corps de la réponse

        loaderOverlay.style.display = "none"; // Masquer le loader

        if (data.success) {
            document.getElementById('confirmation').innerHTML = `<h2>✅ Merci pour votre vote !</h2>
            <p>Votre participation a été enregistrée avec succès.</p>`;
        }
        else {
            document.getElementById('confirmation').innerHTML = `<h2>📌 Vote déjà enregistré</h2>
            <p>Notre système indique que vous avez déjà participé au vote.</p>
            <p>🗳️ Un seul vote est autorisé par étudiant, conformément aux règles de l’élection.</p>
            <p>Merci pour votre compréhension.</p>
`;
        }

        document.getElementById('voteForm').style.display = 'none'; // Masquer le formulaire
        document.querySelector('.form-info').style.display = 'none';
        document.getElementById('confirmation').classList.add('show');


    } catch (error) {
        console.error("Erreur lors de l'envoi du vote :", error);
        alert("Une erreur est survenue lors de l'envoi du vote. Veuillez réessayer.");
    }
}