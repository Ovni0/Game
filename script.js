const character = document.getElementById('character');
const monster = document.getElementById('monster');
const staminaFill = document.getElementById('dashCooldownFill'); // Usamos la barra de cooldown para la estamina
const monsterHealthFill = document.getElementById('monsterHealthFill');
const menu = document.getElementById('menu');
const startButton = document.getElementById('startButton');
const gameArea = document.getElementById('gameArea');

const baseStep = 10; // Velocidad normal
const runStep = 20; // Velocidad al correr
const staminaDrainRate = 2; // Reducción de estamina al correr
const staminaRecoveryRate = 1; // Recuperación de estamina al dejar de correr
const maxStamina = 100; // Estamina máxima
let stamina = maxStamina; // Estamina actual
let activeKeys = {};
let characterPos = { x: 10, y: 10 };
let isRunning = false; // Está corriendo
let movementInterval, monsterShootInterval, monsterSuperAttackInterval;
let monsterHealth = 200; // Salud del monstruo

const magicCooldown = 2000; // 2 segundos de cooldown para el ataque del personaje
let magicAvailable = true; // Indica si el ataque está disponible

startButton.addEventListener('click', startGame);

function startGame() {
    menu.classList.add('hidden'); // Asegúrate de que se oculte el menú
    gameArea.classList.remove('hidden'); // Muestra el área del juego
    gameArea.classList.add('active'); // Activa el área del juego

    resetGame(); // Resetea el juego
    initializeGame(); // Inicializa el juego
}

function initializeGame() {
    characterPos = { x: 10, y: 10 };
    stamina = maxStamina;
    monsterHealth = 200; // Reinicia la salud del monstruo
    staminaFill.style.width = '100%'; // Rellena la barra de estamina
    character.style.left = characterPos.x + 'px';
    character.style.top = characterPos.y + 'px';

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('click', handleClick);

    movementInterval = setInterval(moveCharacter, 50);
    monsterShootInterval = setInterval(shootMagic, 1000);
    monsterSuperAttackInterval = setInterval(superAttack, 5000);
}

function endGame() {
    clearInterval(movementInterval);
    clearInterval(monsterShootInterval);
    clearInterval(monsterSuperAttackInterval);

    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.removeEventListener('click', handleClick);

    gameArea.classList.remove('active');
    gameArea.classList.add('hidden');
    menu.classList.remove('hidden');
    alert('Game Over!');
}

function resetGame() {
    document.querySelectorAll('.magic').forEach(magic => magic.remove());
}

function handleKeyDown(e) {
    activeKeys[e.key.toLowerCase()] = true;
    if (e.key === 'Shift') isRunning = true;
}

function handleKeyUp(e) {
    activeKeys[e.key.toLowerCase()] = false;
    if (e.key === 'Shift') isRunning = false;
}

function handleClick(e) {
    if (magicAvailable) {
        shootCharacterMagic(e.clientX, e.clientY);
    }
}

function moveCharacter() {
    let step = baseStep; // Velocidad normal

    // Verifica si se está corriendo
    if (isRunning && stamina > 0) {
        step = runStep; // Aumenta la velocidad
        stamina -= staminaDrainRate; // Reduce la estamina al correr
        if (stamina <= 0) {
            stamina = 0;
            isRunning = false; // Detiene la carrera si la estamina se agota
        }
    } else if (stamina < maxStamina) {
        stamina += staminaRecoveryRate; // Recupera estamina al dejar de correr
    }

    staminaFill.style.width = `${(stamina / maxStamina) * 100}%`; // Actualiza la barra de estamina

    // Movimiento del personaje
    if (activeKeys['w']) characterPos.y -= step;
    if (activeKeys['s']) characterPos.y += step;
    if (activeKeys['a']) characterPos.x -= step;
    if (activeKeys['d']) characterPos.x += step;

    // Aplicar la posición actual
    character.style.left = characterPos.x + 'px';
    character.style.top = characterPos.y + 'px';
}

function shootCharacterMagic(mouseX, mouseY) {
    const magic = document.createElement('div');
    magic.classList.add('magic');
    magic.style.top = character.offsetTop + 25 + 'px';
    magic.style.left = character.offsetLeft + 25 + 'px';
    document.body.appendChild(magic);

    const angle = Math.atan2(mouseY - (character.offsetTop + 25), mouseX - (character.offsetLeft + 25));
    const speed = 8;
    let magicInterval = setInterval(() => {
        magic.style.left = parseFloat(magic.style.left) + Math.cos(angle) * speed + 'px';
        magic.style.top = parseFloat(magic.style.top) + Math.sin(angle) * speed + 'px';

        if (checkCollision(magic, monster)) {
            clearInterval(magicInterval);
            magic.remove();
            reduceMonsterHealth(20); // Reduce la salud del monstruo al ser golpeado
        }

        if (parseFloat(magic.style.left) > window.innerWidth ||
            parseFloat(magic.style.left) < 0 ||
            parseFloat(magic.style.top) > window.innerHeight ||
            parseFloat(magic.style.top) < 0) {
            clearInterval(magicInterval);
            magic.remove();
        }
    }, 50);

    magicAvailable = false; // Desactiva el ataque
    setTimeout(() => {
        magicAvailable = true; // Vuelve a activar el ataque después del cooldown
    }, magicCooldown);
}

function shootMagic() {
    if (!gameArea.classList.contains('active')) return;

    const magic = document.createElement('div');
    magic.classList.add('magic');
    magic.style.top = monster.offsetTop + 25 + 'px';
    magic.style.left = monster.offsetLeft + 25 + 'px';
    document.body.appendChild(magic);

    const angle = Math.atan2(characterPos.y - (monster.offsetTop + 25), characterPos.x - (monster.offsetLeft + 25));
    const speed = 8;
    let magicInterval = setInterval(() => {
        magic.style.left = parseFloat(magic.style.left) + Math.cos(angle) * speed + 'px';
        magic.style.top = parseFloat(magic.style.top) + Math.sin(angle) * speed + 'px';

        if (checkCollision(magic, character)) {
            clearInterval(magicInterval);
            magic.remove();
            endGame(); // Termina el juego si el personaje es golpeado
        }

        if (parseFloat(magic.style.left) > window.innerWidth ||
            parseFloat(magic.style.left) < 0 ||
            parseFloat(magic.style.top) > window.innerHeight ||
            parseFloat(magic.style.top) < 0) {
            clearInterval(magicInterval);
            magic.remove();
        }
    }, 50);
}

function superAttack() {
    const attackType = Math.floor(Math.random() * 4); // Elige un ataque aleatorio
    switch (attackType) {
        case 0:
            shootMagic();
            break;
        case 1:
            explosiveAttack();
            break;
        case 2:
            burstAttack();
            break;
        case 3:
            randomMovementAttack();
            break;
    }
}

function explosiveAttack() {
    const magic = document.createElement('div');
    magic.classList.add('magic');
    magic.style.top = monster.offsetTop + 25 + 'px';
    magic.style.left = monster.offsetLeft + 25 + 'px';
    document.body.appendChild(magic);

    const explosionRadius = 100; // Radio de explosión
    const damage = 20; // Daño de explosión

    // Crear un efecto de explosión
    setTimeout(() => {
        magic.remove(); // Elimina el proyectil
        for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 4) { // Explosión en 8 direcciones
            const explosionMagic = document.createElement('div');
            explosionMagic.classList.add('magic');
            explosionMagic.style.top = magic.offsetTop + 'px';
            explosionMagic.style.left = magic.offsetLeft + 'px';
            document.body.appendChild(explosionMagic);

            let speed = 5;
            let explosionInterval = setInterval(() => {
                explosionMagic.style.left = parseFloat(explosionMagic.style.left) + Math.cos(angle) * speed + 'px';
                explosionMagic.style.top = parseFloat(explosionMagic.style.top) + Math.sin(angle) * speed + 'px';

                if (checkCollision(explosionMagic, character)) {
                    clearInterval(explosionInterval);
                    explosionMagic.remove();
                    endGame(); // Termina el juego si el personaje es golpeado
                }

                if (parseFloat(explosionMagic.style.left) > window.innerWidth ||
                    parseFloat(explosionMagic.style.left) < 0 ||
                    parseFloat(explosionMagic.style.top) > window.innerHeight ||
                    parseFloat(explosionMagic.style.top) < 0) {
                    clearInterval(explosionInterval);
                    explosionMagic.remove();
                }
            }, 50);
        }
    }, 100); // Espera un poco para mostrar la explosión
}

function burstAttack() {
    const numberOfBalls = 5; // Número de bolas a disparar
    for (let i = 0; i < numberOfBalls; i++) {
        const magic = document.createElement('div');
        magic.classList.add('magic');
        magic.style.top = monster.offsetTop + 25 + 'px';
        magic.style.left = monster.offsetLeft + 25 + 'px';
        document.body.appendChild(magic);

        const angle = (Math.PI * 2 / numberOfBalls) * i; // Distribuye las bolas en un círculo
        const speed = 5;

        let magicInterval = setInterval(() => {
            magic.style.left = parseFloat(magic.style.left) + Math.cos(angle) * speed + 'px';
            magic.style.top = parseFloat(magic.style.top) + Math.sin(angle) * speed + 'px';

            if (checkCollision(magic, character)) {
                clearInterval(magicInterval);
                magic.remove();
                endGame(); // Termina el juego si el personaje es golpeado
            }

            if (parseFloat(magic.style.left) > window.innerWidth ||
                parseFloat(magic.style.left) < 0 ||
                parseFloat(magic.style.top) > window.innerHeight ||
                parseFloat(magic.style.top) < 0) {
                clearInterval(magicInterval);
                magic.remove();
            }
        }, 50);
    }
}

function randomMovementAttack() {
    const magic = document.createElement('div');
    magic.classList.add('magic');
    magic.style.top = monster.offsetTop + 25 + 'px';
    magic.style.left = monster.offsetLeft + 25 + 'px';
    document.body.appendChild(magic);

    const angle = Math.random() * Math.PI * 2; // Movimiento aleatorio
    const speed = 3;

    let magicInterval = setInterval(() => {
        magic.style.left = parseFloat(magic.style.left) + Math.cos(angle) * speed + 'px';
        magic.style.top = parseFloat(magic.style.top) + Math.sin(angle) * speed + 'px';

        if (checkCollision(magic, character)) {
            clearInterval(magicInterval);
            magic.remove();
            endGame(); // Termina el juego si el personaje es golpeado
        }

        if (parseFloat(magic.style.left) > window.innerWidth ||
            parseFloat(magic.style.left) < 0 ||
            parseFloat(magic.style.top) > window.innerHeight ||
            parseFloat(magic.style.top) < 0) {
            clearInterval(magicInterval);
            magic.remove();
        }
    }, 50);
}
function superAttack() {
    const attackType = Math.floor(Math.random() * 6); // Elige un ataque aleatorio
    switch (attackType) {
        case 0:
            shootMagic();
            break;
        case 1:
            explosiveAttack();
            break;
        case 2:
            burstAttack();
            break;
        case 3:
            randomMovementAttack();
            break;
        case 4:
            multiDirectionalAttack(); // Nuevo ataque en múltiples direcciones
            break;
        case 5:
            zigZagAttack(); // Nuevo ataque en zig-zag
            break;
    }
}

function multiDirectionalAttack() {
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 }
    ];

    directions.forEach(direction => {
        const magic = document.createElement('div');
        magic.classList.add('magic');
        magic.style.top = monster.offsetTop + 25 + 'px';
        magic.style.left = monster.offsetLeft + 25 + 'px';
        document.body.appendChild(magic);

        let speed = 6;
        let magicInterval = setInterval(() => {
            magic.style.left = parseFloat(magic.style.left) + direction.x * speed + 'px';
            magic.style.top = parseFloat(magic.style.top) + direction.y * speed + 'px';

            if (checkCollision(magic, character)) {
                clearInterval(magicInterval);
                magic.remove();
                endGame(); // Termina el juego si el personaje es golpeado
            }

            if (parseFloat(magic.style.left) > window.innerWidth ||
                parseFloat(magic.style.left) < 0 ||
                parseFloat(magic.style.top) > window.innerHeight ||
                parseFloat(magic.style.top) < 0) {
                clearInterval(magicInterval);
                magic.remove();
            }
        }, 50);
    });
}

function zigZagAttack() {
    const magic = document.createElement('div');
    magic.classList.add('magic');
    magic.style.top = monster.offsetTop + 25 + 'px';
    magic.style.left = monster.offsetLeft + 25 + 'px';
    document.body.appendChild(magic);

    let angle = Math.atan2(characterPos.y - (monster.offsetTop + 25), characterPos.x - (monster.offsetLeft + 25));
    let speed = 4;
    let zigZag = 1;
    let zigZagInterval = setInterval(() => {
        const oscillation = Math.sin(Date.now() / 100) * 20; // Oscilación para el movimiento en zig-zag
        magic.style.left = parseFloat(magic.style.left) + Math.cos(angle) * speed + zigZag * Math.cos(angle + Math.PI / 2) * oscillation + 'px';
        magic.style.top = parseFloat(magic.style.top) + Math.sin(angle) * speed + zigZag * Math.sin(angle + Math.PI / 2) * oscillation + 'px';

        if (checkCollision(magic, character)) {
            clearInterval(zigZagInterval);
            magic.remove();
            endGame(); // Termina el juego si el personaje es golpeado
        }

        if (parseFloat(magic.style.left) > window.innerWidth ||
            parseFloat(magic.style.left) < 0 ||
            parseFloat(magic.style.top) > window.innerHeight ||
            parseFloat(magic.style.top) < 0) {
            clearInterval(zigZagInterval);
            magic.remove();
        }
    }, 50);
}
// Función para que las bolas sigan al personaje
function followCharacter(magic, duration) {
    const startTime = Date.now();
    let followInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        if (elapsed < duration) {
            const angle = Math.atan2(characterPos.y - parseFloat(magic.style.top), characterPos.x - parseFloat(magic.style.left));
            const speed = 6; // Velocidad de las bolas que siguen
            magic.style.left = parseFloat(magic.style.left) + Math.cos(angle) * speed + 'px';
            magic.style.top = parseFloat(magic.style.top) + Math.sin(angle) * speed + 'px';

            if (checkCollision(magic, character)) {
                clearInterval(followInterval);
                magic.remove();
                endGame(); // Termina el juego si el personaje es golpeado
            }
        } else {
            clearInterval(followInterval);
            magic.remove(); // Elimina la bola después de 4 segundos
        }
    }, 60);
}

function monsterShootFollowingBalls() {
    const magic = document.createElement('div');
    magic.classList.add('magic', 'follower');
    magic.style.top = monster.offsetTop + 25 + 'px';
    magic.style.left = monster.offsetLeft + 25 + 'px';
    document.body.appendChild(magic);

    followCharacter(magic, 4000); // Hace que la bola siga al personaje por 4 segundos
}

function checkCollision(div1, div2) {
    const rect1 = div1.getBoundingClientRect();
    const rect2 = div2.getBoundingClientRect();

    return !(
        rect1.top > rect2.bottom ||
        rect1.bottom < rect2.top ||
        rect1.right < rect2.left ||
        rect1.left > rect2.right
    );
}

function reduceMonsterHealth(amount) {
    monsterHealth -= amount;
    if (monsterHealth <= 0) {
        alert('¡El monstruo ha sido derrotado!');
        endGame();
    }
    monsterHealthFill.style.width = `${(monsterHealth / 200) * 100}%`; // Actualiza la barra de salud
}

// Monstruo dispara bolas que siguen al personaje
setInterval(monsterShootFollowingBalls, 3000); // Dispara cada 3 segundos