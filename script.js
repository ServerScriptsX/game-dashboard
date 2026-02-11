const SETTINGS = {
    PLACE_ID: 121864768012064, // game id area
    INTERVAL_MS: 15000    // 15 Seconds
};

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