const SETTINGS = {
    PLACE_ID: 121864768012064, // game id area
    INTERVAL_MS: 15000    // 15 Seconds
};

const savedPlaceId = localStorage.getItem('dashboard_place_id');
if (savedPlaceId) {
    SETTINGS.PLACE_ID = parseInt(savedPlaceId, 10);
}

async function syncDashboard() {
    const statusLabel = document.getElementById('status-label');
    
    try {
        if (statusLabel) statusLabel.innerText = "Syncing...";

        // 1. Resolve Universe ID
        const apiRes = await fetch(`https://apis.roproxy.com/universes/v1/places/${SETTINGS.PLACE_ID}/universe`);
        const apiData = await apiRes.json();
        const uId = apiData.universeId;

        // 2. Get Stats & Info
        const statsRes = await fetch(`https://games.roproxy.com/v1/games?universeIds=${uId}`);
        const statsData = await statsRes.json();
        const stats = statsData.data[0];

        if (stats) {
            document.getElementById('game-title').innerText = stats.name;
            document.getElementById('game-creator').innerText = `by ${stats.creator.name}`;

            updateElementWithAnim('playing', stats.playing.toLocaleString());
            updateElementWithAnim('visits', (stats.visits / 1000000).toFixed(1) + "M");
            updateElementWithAnim('favorites', stats.favoritedCount.toLocaleString());

            // Update Capacity Bar
            const bar = document.getElementById('player-bar');
            if (bar) {
                const percentage = Math.min((stats.playing / 1000) * 100, 100);
                bar.style.width = `${percentage}%`;
            }
        }

          const iconRes = await fetch(`https://thumbnails.roproxy.com/v1/places/gameicons?placeIds=${SETTINGS.PLACE_ID}&size=512x512&format=Png&isCircular=false`);
          const iconData = await iconRes.json();

if (iconData.data && iconData.data[0]) {
    const headerTile = document.querySelector('.header-tile');
    if (headerTile) {
        // Set the background image directly on the div
        headerTile.style.backgroundImage = `url('${iconData.data[0].imageUrl}')`;
    }
}

    } catch (err) {
        console.error("Sync Error:", err);
        if (statusLabel) statusLabel.innerText = "Connection Error";
    }
}

function updateElementWithAnim(statName, value) {
    const el = document.querySelector(`[data-stat="${statName}"]`);
    if (el && el.innerText !== value) {
        el.innerText = value;
        el.style.color = "#fff";
        setTimeout(() => {
            el.style.transition = "color 1s ease";
            el.style.color = "var(--accent-blue)";
        }, 100);
    }
}

// reloads the dashboard immediately and then every 15 seconds
syncDashboard(); 
setInterval(syncDashboard, SETTINGS.INTERVAL_MS); 

document.getElementById('refresh-btn')?.addEventListener('click', syncDashboard);

function setupPlaceIdEditor() {
    const footer = document.querySelector('.status-footer');
    if (!footer) return;

    const editorContainer = document.createElement('div');
    editorContainer.style.display = 'flex';
    editorContainer.style.alignItems = 'center';
    editorContainer.style.gap = '10px';

    const placeIdInput = document.createElement('input');
    placeIdInput.type = 'text';
    placeIdInput.id = 'place-id-input';
    placeIdInput.placeholder = 'Enter Place ID';
    placeIdInput.value = SETTINGS.PLACE_ID;
    placeIdInput.style.cssText = `
        padding: 10px;
        border: 1px solid var(--tile-bg);
        border-radius: 8px;
        background-color: var(--bg-dark);
        color: var(--text-main);
        width: 150px;
    `;

    const saveBtn = document.createElement('button');
    saveBtn.id = 'save-place-id-btn';
    saveBtn.innerText = 'Save';
    saveBtn.style.cssText = `
        background: var(--accent-blue); border: none; color: rgb(0, 0, 0); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background-color var(--transition-speed);
    `;

    saveBtn.addEventListener('click', () => {
        const newPlaceId = parseInt(placeIdInput.value, 10);
        if (!isNaN(newPlaceId) && newPlaceId > 0) {
            SETTINGS.PLACE_ID = newPlaceId;
            localStorage.setItem('dashboard_place_id', newPlaceId);
            syncDashboard();
        } else {
            alert('Please enter a valid Place ID.');
        }
    });

    editorContainer.appendChild(placeIdInput);
    editorContainer.appendChild(saveBtn);
    footer.appendChild(editorContainer);
}

setupPlaceIdEditor();
