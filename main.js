const can_edit = localStorage.getItem('edit_mode') == '1';
let editing = false;

let highest_unlocked = parseInt(localStorage.getItem('highest_unlocked_level'), 10) || 0;

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const gltf_loader = new GLTFLoader();

const canvas = document.querySelector('canvas');

const crosshair = document.getElementById('crosshair');

let clicked = false;
canvas.addEventListener('click', () => {
    if (inside) {
        clicked = true;
    }
});


let keys = {};
addEventListener('keydown', e => {
    let key = e.key.toLowerCase();
    if (key == 'escape') {
        exit();
    }
    if (key == ' ') {
        keys.jump = true;
    }
    if (key == 'w')     keys.forward  = true;
    if (key == 's')     keys.backward = true;
    if (key == 'a')     keys.left     = true;
    if (key == 'd')     keys.right    = true;
    if (key == 'shift') keys.shift    = true;

    if (e.key == '=' && can_edit) {
        editing = !editing;
    }
});
addEventListener('keyup', e => {
    let key = e.key.toLowerCase();
    if (key == ' ') {
        keys.jump = false;
    }
    if (key == 'w')     keys.forward  = false;
    if (key == 's')     keys.backward = false;
    if (key == 'a')     keys.left     = false;
    if (key == 'd')     keys.right    = false;
    if (key == 'shift') keys.shift    = false;
});

// let the_MUFFIN = {
//     node: new THREE.Object3D(),
//     x: 0,
//     y: 0,
//     z: 0,
//     dx: 0,
//     dy: 0,
//     dz: 0,
//     colliders: [
//         { x: -0.5, y: 0, z: -0.5, w: 1, h: 1, d: 1 }
//     ]
// }

let models = {
    'flashlight': () => {
        let o = {
            node: models.flashlight.node.clone(),
            x: 0,
            y: 0,
            z: 0,
            dx: 0,
            dy: 0,
            dz: 0,
            colliders: [
                { x: -0.3, y: -0.3, z: -0.3, w: 0.6, h: 0.6, d: 0.6 }
            ],
            ok: object => object.parent && object.parent.parent == o.node,
            target: new THREE.Object3D(),
        };
        o.light = o.node.children[models.flashlight.light_index];
        o.node.add(o.target);
        o.target.position.set(0, 0, 1);
        o.light.target = o.target;
        window._l = o.light;
        return o;
    },
    'muffin': () => {
        let o = {
            node: models.muffin.node.clone(),
            x: 0,
            y: 0,
            z: 0,
            dx: 0,
            dy: 0,
            dz: 0,
            colliders: [
                { x: -0.4, y: 0, z: -0.4, w: 0.8, h: 0.9, d: 0.8 }
            ],
            ok: object => object.parent && object.parent.parent == o.node,
            muffin: true,
        };
        return o;
    },
    'box': () => {
        let o = {
            node: models.box.node.clone(),
            x: 0,
            y: 0,
            z: 0,
            dx: 0,
            dy: 0,
            dz: 0,
            colliders: [
                { x: -0.5, y: -0.5, z: -0.5, w: 1, h: 1, d: 1 }
            ],
            ok: object => object.parent && object.parent.parent == o.node,
            // muffin: true,
        };
        return o;
    }
}

let m_resolve, muffin_promise, l_resolve, light_promise, b_resolve, box_promise;
muffin_promise = new Promise(r => {
    m_resolve = r;
});
light_promise = new Promise(r => {
    l_resolve = r;
});
box_promise = new Promise(r => {
    b_resolve = r;
});
gltf_loader.load('muffin.glb', gltf => {
    m_resolve();
    models.muffin.node = gltf.scene;
    // the_MUFFIN.node = gltf.scene;
}, undefined, console.error);
gltf_loader.load('box.glb', gltf => {
    b_resolve();
    models.box.node = gltf.scene;
    gltf.scene.children[0].scale.x =
    gltf.scene.children[0].scale.y =
    gltf.scene.children[0].scale.z = 8;
    // the_MUFFIN.node = gltf.scene;
}, undefined, console.error);
gltf_loader.load('lampe.glb', gltf => {
    l_resolve();
    // the_MUFFIN.node = gltf.scene;
    models.flashlight.node = gltf.scene;
    let light = new THREE.SpotLight();
    light.intensity = 0;
    light.penumbra = 0.2;
    // light.decay
    light.position.set(0, 0, 0);
    light.angle = Math.PI / 10;
    window.light = light;
    models.flashlight.node.add(light);
    models.flashlight.light_index = models.flashlight.node.children.length - 1;
    // models.flashlight.node.add(light.target);
    // let target = new THREE.Object3D();
    // light.add(light.target);
    // light.target.position.set(-1, 0, 0);
    // models.flashlight.node.add(target);
    // light.target = target;
    models.flashlight.node.children[0].rotation.y += Math.PI / 2;
    // the_MUFFIN = models.flashlight();
}, undefined, console.error);

function red_box() {
    let geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    let mat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    return new THREE.Mesh(geo, mat);
}

const BUTTON_EDGE   = new THREE.MeshStandardMaterial({ color: 0xCCCC55, metalness: 1, roughness: 0.75 });
const BUTTON_EDGE_R = new THREE.MeshStandardMaterial({ color: 0xFF55FF, metalness: 1, roughness: 0.25 });
const BUTTON_OFF    = new THREE.MeshStandardMaterial({ color: 0xCC3333, metalness: 0, roughness: 1 });
const BUTTON_ON     = new THREE.MeshBasicMaterial   ({ color: 0x44CC00 });
function wall_button(mode) {
    let edge_geo = new THREE.BoxGeometry(0.5, 0.5, 0.1);
    let mid_geo  = new THREE.BoxGeometry(0.3, 0.3, 0.05);
    let edge     = new THREE.Mesh(edge_geo, mode == 'rigidbody' ? BUTTON_EDGE_R : BUTTON_EDGE);
    let mid      = new THREE.Mesh(mid_geo , BUTTON_OFF);
    let node     = new THREE.Object3D();
    node.add(edge, mid);
    mid.position.set(0, 0, 0.05);
    let state    = false;
    return {
        edge,
        node,
        raycast_target: mid,
        get state() {
            return state;
        },
        set state(v) {
            if (v != state) {
                mid.material = v ? BUTTON_ON : BUTTON_OFF;
            }
            state = v;
        }
    };
}

const player_object = {
    node: new THREE.Object3D(),
    x: 0,
    y: 0,
    z: 0,
    colliders: [
        { x: -0.5, y: 0, z: -0.5, w: 1, h: 1.85, d: 1 }
    ],
    dx: 0,
    dy: 0,
    dz: 0,
    hands: [
        {
            content: null,
            node: new THREE.Object3D(),
        },
        {
            content: null,
            node: new THREE.Object3D(),
        }
    ],
    light_target: new THREE.Object3D(),
};
player_object.node.add(player_object.hands[0].node);
player_object.node.add(player_object.hands[1].node);
player_object.hands[0].node.position.set(-0.7, 1.1, 0);
player_object.hands[1].node.position.set(0.7, 1.1, 0);
// player_object.node.add(player_object.light_target);

let l = new THREE.PointLight(undefined, 10);
// l.castShadow = true;
l.position.set(0, 1.8, 0);
player_object.node.add(l);

const raycaster = new THREE.Raycaster();
raycaster.far = 3;

const LEVEL_COUNT = 7;
let levels = [];
let level = {
    scene: new THREE.Scene(),
};

let static_colliders = [];
let rigidbodies      = [];
let items            = [];
let buttons          = [];
let button_map       = {};

let last_group    = Symbol('last group');
let last_collider = Symbol('last collider');
function is_colliding_with(rigidbody, o, stat) {
    for (let k = 0; k < rigidbody.colliders.length; k++) {
        let c = rigidbody.colliders[k];
        if (c.OFF) continue;
        // let stat = rigidbody[last_group];
        // let o = rigidbody[last_collider];
        if (
            o.x + stat.x <= c.x + rigidbody.x + c.w
         && o.x + stat.x + o.w >= c.x + rigidbody.x
         && o.y + stat.y <= c.y + rigidbody.y + c.h
         && o.y + stat.y + o.h >= c.y + rigidbody.y
         && o.z + stat.z <= c.x + rigidbody.z + c.d
         && o.z + stat.z + o.d >= c.z + rigidbody.z
        ) {
            return o.exit ? 42 : true;
        }
    }
    return false;
}
function is_colliding(rigidbody) {
    if (rigidbody[last_group]) {
        for (let k = 0; k < rigidbody.colliders.length; k++) {
            let c = rigidbody.colliders[k];
            if (c.OFF) continue;
            let stat = rigidbody[last_group];
            let o = rigidbody[last_collider];
            if (
                o.x + stat.x <= c.x + rigidbody.x + c.w
             && o.x + stat.x + o.w >= c.x + rigidbody.x
             && o.y + stat.y <= c.y + rigidbody.y + c.h
             && o.y + stat.y + o.h >= c.y + rigidbody.y
             && o.z + stat.z <= c.x + rigidbody.z + c.d
             && o.z + stat.z + o.d >= c.z + rigidbody.z
            ) {
                return o.exit ? 42 : true;
            }
        }
    }
    for (let k = 0; k < rigidbody.colliders.length; k++) {
        let c = rigidbody.colliders[k];
            if (c.OFF) continue;
            for (let i = 0; i < static_colliders.length; i++) {
            let stat = static_colliders[i];
            let length = stat.colliders.length;
            for (let j = 0; j < length; j++) {
                let o = static_colliders[i].colliders[j];
                if (
                    o.x + stat.x <= c.x + rigidbody.x + c.w
                 && o.x + stat.x + o.w >= c.x + rigidbody.x
                 && o.y + stat.y <= c.y + rigidbody.y + c.h
                 && o.y + stat.y + o.h >= c.y + rigidbody.y
                 && o.z + stat.z <= c.x + rigidbody.z + c.d
                 && o.z + stat.z + o.d >= c.z + rigidbody.z
                ) {
                    rigidbody[last_group]    = stat;
                    rigidbody[last_collider] = o;
                    return o.exit ? 42 : true;
                }
            }
        }
        if (rigidbody != player_object) {
            for (let i = 0; i < rigidbodies.length; i++) {
                let dyn = rigidbodies[i];
                if (dyn == rigidbody || (dyn == player_object /* lol */)) continue;
                let length = rigidbodies[i].colliders.length;
                for (let j = 0; j < length; j++) {
                    let o = dyn.colliders[j];
                    if (
                        o.x + dyn.x <= c.x + rigidbody.x + c.w
                     && o.x + dyn.x + o.w >= c.x + rigidbody.x
                     && o.y + dyn.y <= c.y + rigidbody.y + c.h
                     && o.y + dyn.y + o.h >= c.y + rigidbody.y
                     && o.z + dyn.z <= c.x + rigidbody.z + c.d
                     && o.z + dyn.z + o.d >= c.z + rigidbody.z
                    ) {
                        return dyn;
                    }
                }
            }
        }
    }
    return false;
}

let sensitivity   = parseFloat(localStorage.getItem('sens') || '0.4');
let last_language = 'fr';

const menu = (() => {
    let full_ = false;
    let element             = document.getElementById('menu'),
        main                = document.getElementById('main'),
        settings            = document.getElementById('settings'),
        victory             = document.getElementById('victory'),
        play_button         = document.getElementById('play'),
        level_select_button = document.getElementById('level-select'),
        settings_button     = document.getElementById('go-to-settings'),
        back_button         = document.getElementById('back'),
        french_button       = document.getElementById('french'),
        english_button      = document.getElementById('english'),
        loading             = document.getElementById('loading'),
        level_select        = document.getElementById('level-selector'),
        remove_me           = document.getElementById('remove-after-loading'),
        continue_button     = document.getElementById('continue'),
        victory_message     = document.getElementById('victory-message'),
        reset_button        = document.getElementById('reset'),
        sens_text           = document.getElementById('sens-text'),
        sens_value          = document.getElementById('sens-value'),
        sens                = document.getElementById('sens'),
        restart_button      = document.getElementById('restart');
    
    sens.value = sensitivity * 100;
    sens_value.innerText = (sensitivity * 100).toFixed(1);
    sens.addEventListener('input', () => {
        sensitivity = parseFloat(sens.value) / 100;
        sens_value.innerText = (sensitivity * 100).toFixed(1);
        localStorage.setItem('sens', sensitivity.toFixed(1));
    });

    function button_actions(array) {
        array.forEach(([button, action]) => {
            button.addEventListener('click', () => {
                if (!button.classList.contains('disabled')) {
                    action();
                }
                // if (button == 0) {
                // }
            });
        });
    }

    let loaded             = false;
    let resume             = false;
    let level_button_spans = [];

    button_actions([
        [settings_button    , () => switch_screen('settings')                        ],
        [back_button        , () => switch_screen('main')                            ],
        [french_button      , () => update_for_language('fr')                        ],
        [english_button     , () => update_for_language('en')                        ],
        [level_select_button, () => { if (loaded) { switch_screen('levels'); } }     ],
        [continue_button    , () => {
            if (full_) {
                switch_screen('main');
                load_level(0);
            } else {
                switch_screen('main');
                load_level(Math.min(levels.indexOf(level) + 1, LEVEL_COUNT - 1));
                // load_level(Math.min(highest_unlocked, LEVEL_COUNT - 1));
                lock();
            }
        }],
        [reset_button       , () => {
            if (!confirm(last_language == 'fr' ? 'Réinitialiser ? Vous devrez recommencer au niveau 1.' : 'Reset? You\'ll have to restart from level one.')) {
                return;
            }
            localStorage.removeItem('highest_unlocked_level');
            highest_unlocked = 0;
            resume = false;
            update_for_language(last_language);
            load_level(0);
        }],
        [restart_button     , () => {
            load_level(levels.indexOf(level));
        }],
        [play_button        , () => {
            if (loaded) {
                resume = true;
                play_button.innerText = last_language == 'fr' ? 'Continuer' : 'Resume';
                lock();
            }
        }],
    ]);

    function update_for_language(lang, full) {
        full_ = full;
        // return
        localStorage.setItem('lang', lang);
        last_language = lang;

        if (resume) {
            play_button    .innerText = lang == 'fr' ? 'Continuer'                 : 'Resume';
        } else {
            play_button    .innerText = lang == 'fr' ? 'Jouer'                     : 'Play';
        }
        level_select_button.innerText = lang == 'fr' ? 'Sélection de niveau'       : 'Level select';
        settings_button    .innerText = lang == 'fr' ? 'Paramètres'                : 'Settings';
        back_button        .innerText = lang == 'fr' ? 'Retour'                    : 'Back';
        loading            .innerText = lang == 'fr' ? 'Chargement des niveaux...' : 'Loading levels...';
        reset_button       .innerText = lang == 'fr' ? 'Réinitialiser'             : 'Reset';
        restart_button     .innerText = lang == 'fr' ? 'Recommencer le niveau'     : 'Restart level';
        sens_text          .innerText = lang == 'fr' ? 'Sensibilité'               : 'Sensitivity';
        if (full) {
            continue_button.innerText = lang == 'fr' ? 'Retour'                    : 'Back';
            victory_message.innerText = lang == 'fr' ? 'vous avez gagné :)'        : 'you won :)'
        } else {
            continue_button.innerText = lang == 'fr' ? 'Continuer'                 : 'Continue';
            victory_message.innerText = lang == 'fr' ? 'victoire partielle'        : 'partial victory';
        }

        level_button_spans.forEach((span, i) => {
            span.innerText = lang == 'fr' ? 'Niveau' : 'Level';
            if (highest_unlocked < i) {
                span.parentElement.classList.add('disabled');
            } else {
                span.parentElement.classList.remove('disabled');
            }
        });
    }

    function switch_screen(new_one) {
        new_one = {
            'main'     : main,
            'settings' : settings,
            'levels'   : level_select,
            'victory'  : victory,
        }[new_one];
        for (let element of [main, settings, level_select, victory]) {
            if (element != new_one) {
                element.classList.add('hidden');
            }
        }
        new_one.classList.remove('hidden');
    }

    function done_loading() {
        loading  .classList.add('hidden');
        remove_me.classList.add('hidden');

        for (let i = 0; i < levels.length; i++) {
            if (i != 0) {
                level_select.appendChild(document.createElement('br'));
            }
            let button = document.createElement('button');
            button_actions([[button, () => {
                resume = true;
                play_button.innerText = last_language == 'fr' ? 'Jouer' : 'Play';
                load_level(i);
                switch_screen('main');
            }]]);
            let span_1 = document.createElement('span');
            let span_2 = document.createElement('span');
            span_1.innerText = '(...)';
            span_2.innerText = ' ' + (i + 1).toString();
            button.appendChild(span_1);
            button.appendChild(span_2);
            level_select.appendChild(button);
            level_button_spans.push(span_1);
        }

        update_for_language(last_language);

        loaded = true;
    }

    return { element, update_for_language, switch_screen, done_loading, button_actions };
})();

menu.update_for_language(localStorage.getItem('lang') || 'fr');
// menu.update_for_language('fr');
menu.switch_screen('main');

async function get_level(level) {
    const response = await fetch(`levels/${level}.json`);
    return await response.json();
}

Promise.all([muffin_promise, light_promise, box_promise].concat(Array(LEVEL_COUNT).fill(0).map((_, i) => get_level(i)))).then(([_muffin, _light, _box, ...the_levels]) => {
    levels = the_levels.map(l => {
        // l.scene = new THREE.Scene();
        return l;
    });
    menu.done_loading();
    load_level(highest_unlocked);
});

let inside = false;
function lock() {
    canvas.requestPointerLock();
    menu.element.classList.add('hidden');
    crosshair.classList.remove('hidden');
    setTimeout(() => inside = true, 50);
}

function exit() {
    document.exitPointerLock();
    menu.element.classList.remove('hidden');
    crosshair.classList.add('hidden');
    inside = false;
}

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setClearColor(0x66CCFF);
renderer.clear();

const camera = new THREE.PerspectiveCamera(70, 1, 0.01, 200);
camera.rotation.order = 'YXZ';
player_object.node.add(camera);
camera.position.set(0, 1.65, 0);
camera.add(player_object.light_target);

canvas.addEventListener('mousemove', e => {
    if (inside) {
        player_object.node.rotation.y += e.movementX * sensitivity / -100;
        camera.rotation.x += e.movementY * sensitivity / -100;

        camera.rotation.x = Math.min(Math.max(-Math.PI / 2, camera.rotation.x), Math.PI / 2);
    }
});

const tloader = new THREE.TextureLoader();

function tload(url, wrap_s, wrap_t) {
    let texture = tloader.load(url);
    texture.wrapS = wrap_s || THREE.RepeatWrapping;
    texture.wrapT = wrap_t || THREE.RepeatWrapping;
    // texture.repeat.x = 2;
    return texture;
}

function repeatBoxGeometry(w, h, d, rx, ry, rz) {
    let geo = new THREE.BoxGeometry(w, h, d, rx, ry, rz);
    return geo;
}

const MATERIALS = [
    new THREE.MeshNormalMaterial(),  // 0
    new THREE.MeshStandardMaterial({ // 1
        map: tload('bois.jpg'),
    }),
    new THREE.MeshStandardMaterial({ // 2
        map: tloader.load('intro.png'),
    }),
    new THREE.MeshStandardMaterial({
        map: tloader.load('intro.png'),
    }),
    new THREE.MeshBasicMaterial({    // 4
        color: 0x000000,
    }),
    new THREE.MeshStandardMaterial({ // 5
        map: tloader.load('exit.png'),
    }),
    new THREE.MeshStandardMaterial({ // 6
        map: tloader.load('dull.png'),
        roughness: 1,
        metalness: 0,
    }),
    new THREE.MeshStandardMaterial({ // 7
        map: tloader.load('floor.png'),
    }),
    new THREE.MeshStandardMaterial({ // 8
        map: tloader.load('ceil.png'),
    }),
    new THREE.MeshBasicMaterial({    // 9
        transparent: true,
        opacity: 0.2,
        color: 0x555500,
    }),
    new THREE.MeshStandardMaterial({ // 10
        map: tloader.load('tile1.png'),
    }),
    new THREE.MeshStandardMaterial({ // 11
        map: tloader.load('tile5.png'),
    }),
];

let average_intensity = 10;
function load_level(n, soft = false) {
    console.log('loading level', n);
    if (!soft) {
        player_object.hands[0].content = null;
        player_object.hands[0].node.remove(...player_object.hands[0].node.children);
        player_object.hands[1].content = null;
        player_object.hands[1].node.remove(...player_object.hands[1].node.children);
    }
    static_colliders = [];
    rigidbodies      = [player_object];
    items            = [];
    buttons          = [];
    button_map       = {};
    delete player_object[last_collider];
    delete player_object[last_group];
    level = levels[n];
    if (level.intensity) {
        l.intensity = average_intensity = level.intensity;
    } else {
        l.intensity = average_intensity = 10;
    }
    level.scene = new THREE.Scene();
    // let l = new THREE.DirectionalLight(undefined, 1);
    // level.scene.add(l.target);
    // l.target.position.x += 0.5;
    // l.target.position.z -= 0.05;
    // level.scene.add(l);
    // level.scene.add(the_MUFFIN.node);
    // the_MUFFIN.x = level.muffin.x;
    // the_MUFFIN.y = level.muffin.y;
    // the_MUFFIN.z = level.muffin.z;
    // the_MUFFIN.dx =
    // the_MUFFIN.dy =
    // the_MUFFIN.dz = 0;
    for (let item of level.items) {
        let o = models[item.kind]();
        o.x = item.x;
        o.y = item.y;
        o.z = item.z;
        items.push(o);
        rigidbodies.push(o);
        level.scene.add(o.node);
    }
    console.log(items);

    for (let group of level.groups) {
        group.node = new THREE.Object3D();
        group.x = group.x || 0;
        group.y = group.y || 0;
        group.z = group.z || 0;
        group.node.position.set(group.x, group.y, group.z);
        group.colliders = [];
        for (let platform of group.platforms) {
            group.colliders.push({
                x: platform.x,
                y: platform.y,
                z: platform.z,
                w: platform.w,
                h: platform.h,
                d: platform.d,
                exit: platform.end,
            });
            let geo = repeatBoxGeometry(platform.w, platform.h, platform.d, 5, 5, 5);
            let mesh = new THREE.Mesh(geo, MATERIALS[platform.material]);
            group.node.add(mesh);
            mesh.position.set(platform.x + platform.w / 2, platform.y + platform.h / 2, platform.z + platform.d / 2);
        }
        if (group.planes) {
            for (let plane of group.planes) {
                let geo = new THREE.PlaneGeometry(plane.width, plane.height);
                let mesh = new THREE.Mesh(geo, plane.material == 2 ? MATERIALS[(last_language == 'fr' ? 2 : 3)] : MATERIALS[plane.material]);
                mesh.rotation.y = plane.rotation || 0;
                group.node.add(mesh);
                mesh.position.set(plane.x, plane.y, plane.z);
            }
        }
        if (group.buttons) {
            for (let button of group.buttons) {
                button.object = wall_button(button.mode);
                button.object.group = group;
                group.node.add(button.object.node);
                button.object.node.position.set(button.x, button.y, button.z);
                button.object.mode = button.mode;
                if (button.rotation) {
                    button.object.node.rotation.order = 'YXZ';
                    button.object.node.rotation.y = button.rotation.y;
                    button.object.node.rotation.x = button.rotation.x;
                }
                if (button.mode == 'rigidbody') {
                    button.object.edge.geometry.computeBoundingBox();
                    button.object.raycast_target.geometry.computeBoundingBox();
                    let box = button.object.edge.geometry.boundingBox;
                    let offset = group.node.getWorldPosition(new THREE.Vector3());
                    console.log(box.min, box.max, offset);
                    group.colliders.push({
                        x: button.x + box.min.x/* - offset.x*/,
                        y: button.y + box.min.y/* - offset.y*/,
                        z: button.z + box.min.z/* - offset.z*/,
                        w: box.max.x - box.min.x,
                        h: box.max.y - box.min.y,
                        d: box.max.z - box.min.z,
                        exit: false,
                    });
                    box = button.object.raycast_target.geometry.boundingBox;
                    button.object.hitbox = {
                        x: button.x + box.min.x/* - offset.x*/,
                        y: button.y + box.min.y/* - offset.y*/ + (button.rotation.x > 0 ? -0.4 : 0.4),
                        z: button.z + box.min.z/* - offset.z*/,
                        w: box.max.x - box.min.x,
                        h: box.max.y - box.min.y,
                        d: box.max.z - box.min.z,
                        exit: false,
                    };
                }
                buttons.push(button.object);
                button_map[button.id] = button.object;
            }
        }
        if (group.lights) {
            for (let light of group.lights) {
                let color = parseInt(light.color) || 0xFFFFFF;
                light.node = new THREE.PointLight(color, light.intensity || 1);
                group.node.add(light.node);
                light.node.position.set(light.x, light.y, light.z);
            }
        }
        if (group.kind == 'rigidbody') {
            rigidbodies.push(group);
            group.dx = 0;
            group.dy = 0;
            group.dz = 0;
        } else {
            if (group.kind == '2s') {
                group.now = 0;
            }
            static_colliders.push(group);
        }
        level.scene.add(group.node);
    }

    level.scene.add(player_object.node);
    if (!soft) {
        player_object.x  = level.spawn.x
    };
    if (!soft) {
        player_object.y  = level.spawn.y
    };
    if (!soft) {
        player_object.z  = level.spawn.z
    };
    player_object.dx = 0;
    player_object.dy = 0;
    player_object.dz = 0;
    console.log(player_object);

    console.log(level.scene);

    if (can_edit) {
        level.scene.add(editor.helper);
        level.scene.add(editor.arrows.x);
        level.scene.add(editor.arrows.y);
        level.scene.add(editor.arrows.z);
    }

    renderer.setClearColor(parseInt(level.sky_color));
}

let last = performance.now();

let editor = {
    helper: new THREE.BoxHelper(),
    arrows: {
        x: new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), undefined, 2, 0xFF0000),
        y: new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), undefined, 2, 0x00FF00),
        z: new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), undefined, 2, 0x0000FF),
    }
}

function easeInOutQuad(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
}

function ease(x) {
    return easeInOutQuad(x, 0, 1, 1);
}

let freq1_n = 0,
    freq1_l = 1,
    freq1_a = 0.3,
    freq1_v = 0,
    freq2_n = 0,
    freq2_l = 10,
    freq2_a = 0.2,
    freq2_v = 0,
    freq3_n = 0,
    freq3_l = 100,
    freq3_a = 0.6,
    freq3_v = 0;
setInterval(() => {
    return;
    freq1_n++;
    freq2_n++;
    freq3_n++;
    freq1_n %= freq1_l;
    freq2_n %= freq2_l;
    freq3_n %= freq3_l;
    if (freq1_n == 0) {
        freq1_v = freq1_a * (Math.random() - 0.5);
    }
    if (freq2_n == 0) {
        freq2_v = freq2_a * (Math.random() - 0.5);
    }
    if (freq3_n == 0) {
        freq3_v = freq3_a * (Math.random() - 0.5);
    }
    l.intensity = average_intensity * (1 + freq1_v + freq2_v + freq3_v + (Math.random() > 0.99 ? 2 : 0));
}, 50);

function update() {
    window.__rb = rigidbodies;
    window.TREE = THREE;
    const now = performance.now();
    const delta = inside ? Math.min(1 / 15, (now - last) / 1000) : 0;
    last = now;

    if (editing) {
        player_object.dx =
        player_object.dy =
        player_object.dz = 0;
        player_object.colliders[0].OFF = true;
        // player_object.colliders[0].h =
        // player_object.colliders[0].d = -0.01;
    } else {
        player_object.colliders[0].OFF = false;
        // player_object.colliders[0].w = 1;
        // player_object.colliders[0].h = 1.85;
        // player_object.colliders[0].d = 1;
    }

    if (player_object.status == 42 && player_object.hands.some(h => h.content && h.content.muffin)) {
        highest_unlocked = Math.min(levels.indexOf(level) + 1, LEVEL_COUNT - 1);
        localStorage.setItem('highest_unlocked_level', highest_unlocked.toString());
        menu.update_for_language(last_language, level == levels[levels.length - 1]);
        menu.switch_screen('victory');
        exit();
    }

    if (level.groups) {
        for (let group of level.groups) {
            if (group.kind == '2s') {
                let old_x = group.x;
                let old_y = group.y;
                let old_z = group.z;
                let old_now = group.now;
                window._bm = button_map;
                let target = button_map[group.trigger].state ? 1 : 0;
                group.now += (target - group.now) * delta * (1 / group.transition_time);
                group.now = Math.min(Math.max(0, group.now), 1);
                let fac = ease(group.now);
                group.x = group.on.x * fac + group.off.x * (1 - fac);
                group.y = group.on.y * fac + group.off.y * (1 - fac);
                group.z = group.on.z * fac + group.off.z * (1 - fac);
                let collided = [];
                lo: for (let i = 0; i < rigidbodies.length; i++) {
                    let rigidbody = rigidbodies[i];
                    if (!is_colliding(rigidbody)) continue;
                    rigidbody.x += (group.x - old_x);
                    rigidbody.y += (group.y - old_y);
                    rigidbody.z += (group.z - old_z);
                    let list = [rigidbody];
                    let acc  = [rigidbody];
                    while (list.length > 0) {
                        let you = list.shift();
                        let c;
                        if (c = is_colliding(you)) {
                            if (c.colliders) {
                                c.x += (group.x - old_x);
                                c.y += (group.y - old_y);
                                c.z += (group.z - old_z);
                                acc.push(c);
                                list.push(c);
                            } else {
                                group.now = old_now;
                                for (let a of acc) {
                                    a.x -= (group.x - old_x);
                                    a.y -= (group.y - old_y);
                                    a.z -= (group.z - old_z);
                                }
                                for (let a of collided) {
                                    a.x -= (group.x - old_x);
                                    a.y -= (group.y - old_y);
                                    a.z -= (group.z - old_z);
                                }
                                group.x = old_x;
                                group.y = old_y;
                                group.z = old_z;
                                break lo;
                            }
                            // collided.push(rigidbody);
                            // if (is_colliding(rigidbody)) {
                            //     group.now = old_now;
                            //     for (let moved of collided) {
                            //         moved.x -= (group.x - old_x);
                            //         moved.y -= (group.y - old_y);
                            //         moved.z -= (group.z - old_z);
                            //     }
                            //     group.x = old_x;
                            //     group.y = old_y;
                            //     group.z = old_z;
                            //     break;
                            // }
                        }
                    }
                    for (let a of acc) {
                        collided.push(a);
                    }
                    
                }
                group.node.position.x = group.x;
                group.node.position.y = group.y;
                group.node.position.z = group.z;
            }
        }
    }

    if (inside) {
        if (keys.forward) {
            player_object.dx -= 7 * Math.sin(player_object.node.rotation.y) * 2;
            player_object.dz -= 7 * Math.cos(player_object.node.rotation.y) * 2;
        }

        if (keys.backward) {
            player_object.dx += 7 * Math.sin(player_object.node.rotation.y) * 2;
            player_object.dz += 7 * Math.cos(player_object.node.rotation.y) * 2;
        }

        if (keys.left) {
            player_object.dx -= 7 * Math.sin(player_object.node.rotation.y + Math.PI / 2) * 2;
            player_object.dz -= 7 * Math.cos(player_object.node.rotation.y + Math.PI / 2) * 2;
        }

        if (keys.right) {
            player_object.dx += 7 * Math.sin(player_object.node.rotation.y + Math.PI / 2) * 2;
            player_object.dz += 7 * Math.cos(player_object.node.rotation.y + Math.PI / 2) * 2;
        }
    }

    if (keys.jump && editing) {
        if (keys.shift) {
            player_object.dy = -7;
        } else {
            player_object.dy = 7;
        }
    }

    rigidbodies.forEach(rigidbody => {
    	let old_x = rigidbody.x;
    	let old_z = rigidbody.z;
    	let old_dx = rigidbody.dz;
    	let old_dz = rigidbody.dz;
        rigidbody.x += rigidbody.dx * delta;
        rigidbody.z += rigidbody.dz * delta;
        if (is_colliding(rigidbody)) {
            let original_y = rigidbody.y;
            let slope = 0;
            while (is_colliding(rigidbody) && slope < 5) {
                rigidbody.y += 0.05;
                slope       += 1;
            }
            // console.log('slope', slope);
            if (slope <= 4) {

            } else {
                rigidbody.y = original_y;
                rigidbody.x = old_x;
                //rigidbody.dx = 0;
                // rigidbody.x -= rigidbody.dx * delta;
                if (is_colliding(rigidbody)) {
                    rigidbody.x += rigidbody.dx * delta;
                    //rigidbody.dx = old_dx;
                    rigidbody.z = old_z;
                    //rigidbody.dz = 0;
                    // rigidbody.z -= rigidbody.dz * delta;
                    if (is_colliding(rigidbody)) {
                    	rigidbody.x = old_x;
                    	//rigidbody.dx = 0;
                        // rigidbody.x -= rigidbody.dx * delta;
                        // rigidbody.z -= rigidbody.dz * delta;
                    }
                }
            }
        }

        rigidbody.y += rigidbody.dy * delta;
        let collided = false;
        let c;
        while (c = is_colliding(rigidbody)) {
            collided = c;
            rigidbody.y -= (rigidbody.dy / 10) * delta;
        }
        rigidbody.status = collided;
        // if (collided == 42) console.log('meow');
        if (collided) {
            if (player_object == rigidbody && keys.jump && rigidbody.dy < 0) {
                rigidbody.dy = 15;
            } else {
                rigidbody.dy = 0;
            }
            // rigidbody.y = Math.round(rigidbody.y * 1) / 1;
            
        } else {
            rigidbody.dy -= 30 * delta;
        }

        let drag = rigidbody == player_object ? 0 : (collided ? 0.0001 : 0.95);
        rigidbody.dx *= drag ** delta;
        rigidbody.dy *= 0.99 ** delta;
        rigidbody.dz *= drag ** delta;

    });

    rigidbodies.forEach(rigidbody => {
        rigidbody.node.position.set(rigidbody.x, rigidbody.y, rigidbody.z);
    });

    buttons.forEach(b => {
        if (b.mode == 'rigidbody') {
            window._e = b;
            if (rigidbodies.some(r => is_colliding_with(r, b.hitbox, b.group))) {
                b.state = true;
            } else {
                b.state = false;
            }
        }
    });

    raycaster.setFromCamera(new THREE.Vector2(), camera);
    let intersection = raycaster.intersectObjects(level.scene.children);
    if (!editing) {
        let hand = keys.shift ? player_object.hands[1] : player_object.hands[0];
        let maybe_button = intersection[0] && buttons.find(b => b.raycast_target == intersection[0].object && b.mode != 'rigidbody');
        let item = null;
        if (clicked) {
            if (maybe_button) {
                maybe_button.state = !maybe_button.state;
            } else {
                if (hand.content) {
                    let object = hand.content;
                    hand.content = null;
                    if (object.light) {
                        object.node.rotation.x =
                        object.node.rotation.y =
                        object.node.rotation.z = 0;
                        object.light.intensity = 0;
                        object.light.target = object.target;
                    }
                    let world_pos = camera.getWorldPosition(new THREE.Vector3());
                    object.x = world_pos.x;
                    object.y = world_pos.y - 0.5;
                    object.z = world_pos.z;
                    object.dx = (-3 * Math.sin(player_object.node.rotation.y) * Math.cos(camera.rotation.x)) + player_object.dx;
                    object.dz = (-3 * Math.cos(player_object.node.rotation.y) * Math.cos(camera.rotation.x)) + player_object.dz;
                    object.dy = player_object.dy + 3 * Math.sin(camera.rotation.x);
                    level.scene.add(hand.node.children[0]);
                    rigidbodies.push(object);
                    if (is_colliding(object)) {
                        item = object;
                    }
                }
            }
        }
        item = item || (intersection[0] && items.filter(x => x.ok(intersection[0].object))[0]);
        // let muffin = intersection[0] && intersection[0].object && intersection[0].object.parent && intersection[0].object.parent && intersection[0].object.parent.parent == the_MUFFIN.node;
        crosshair.style.transform = item ? 'scale(2)' : (maybe_button ? 'rotate(45deg)' : 'scale(1)');
        if (item && clicked) {
            hand.content = item;
            if (hand.content.light) {
                hand.content.light.intensity = 70;
                hand.content.light.target = player_object.light_target;
            }
            hand.node.add(item.node);
            // window._p = player_object;
            item.node.position.set(0, 0, 0);
            item.x  =
            item.dx =
            item.y  =
            item.dy =
            item.z  =
            item.dz = 0;
            rigidbodies.splice(rigidbodies.indexOf(item), 1);
        }
        editor.helper.visible = false;
        editor.arrows.x.visible =
        editor.arrows.y.visible =
        editor.arrows.z.visible = false;
    } else {
        raycaster.far = 50;
        let object = null;
        if (intersection[0]) {
            object = intersection[0].object;
            if (clicked) {
                editor.helper.visible = true;
                editor.arrows.x.visible =
                editor.arrows.y.visible =
                editor.arrows.z.visible = true;
                window._ed = editor;
                editor.helper.setFromObject(object);
                let world_pos = object.getWorldPosition(new THREE.Vector3());
                let bounding_box = object.geometry.boundingBox;
                // console.log(bounding_box);
                editor.arrows.x.setLength(bounding_box.max.x + 1);
                editor.arrows.y.setLength(bounding_box.max.y + 1);
                editor.arrows.z.setLength(bounding_box.max.z + 1);
                editor.arrows.x.position.set(world_pos.x, world_pos.y, world_pos.z);
                editor.arrows.y.position.set(world_pos.x, world_pos.y, world_pos.z);
                editor.arrows.z.position.set(world_pos.x, world_pos.y, world_pos.z);
                console.log('meow');
            }
        }
        crosshair.style.transform = object ? 'scale(2) rotate(45deg)' : 'scale(1) rotate(45deg)';
        
    }
    
    // pos.y = -camera.getWorldPosition(new THREE.Vector3()).y + 3;
    // pos.add(camera.getWorldDirection(new THREE.Vector3()));
    player_object.light_target.position.set(0, 0, -10);
    for (let hand of player_object.hands) {
        if (hand.content && hand.content.light) {
            hand.node.children[0].lookAt(player_object.light_target.getWorldPosition(new THREE.Vector3()));
        }
    }

    renderer.render(level.scene, camera);

    if (player_object.y < -50) {
        load_level(levels.indexOf(level));
        player_object.dy = 0;
    }
    if (inside && document.pointerLockElement == null) {
        exit();
    }
    clicked = false;
    requestAnimationFrame(update);
}

update();

function resize() {
    const width   = window.innerWidth;
    const height  = window.innerHeight;
    canvas.width  = width;
    canvas.height = height;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.updateWorldMatrix();
    renderer.setSize(width, height);
}
addEventListener('resize', resize);
resize();
exit();

