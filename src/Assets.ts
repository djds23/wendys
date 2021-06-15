import { Character } from "./Character"

interface Asset {
    key: string
    path: string
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig | undefined
}

interface Attackable {
    damageFrames: Array<number>
}

type AttackAsset = Asset & Attackable
interface CharacterAsset {
    idle: Asset
    run: Asset
    attack: AttackAsset 
}

class BlueWitch implements CharacterAsset {
    attack: AttackAsset = {
        key: "assets/images/Blue_witch/B_witch_attack.png",
        path: "assets/images/Blue_witch/B_witch_attack.png",
        frameConfig: {
            frameWidth: 104,
            frameHeight: 46
        },
        damageFrames: [6, 7, 8]
    }

    run: Asset = {
        key: "assets/images/Blue_witch/B_witch_run.png",
        path: "assets/images/Blue_witch/B_witch_run.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 48

        }
    }

    idle: Asset = {
        key: "assets/images/Blue_witch/B_witch_idle.png",
        path: "assets/images/Blue_witch/B_witch_idle.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 48

        }
    }
}

class RedWitch implements CharacterAsset {
    attack: AttackAsset = {
        key: "assets/images/Red_witch/R_witch_attack.png",
        path: "assets/images/Red_witch/R_witch_attack.png",
        frameConfig: {
            frameWidth: 155,
            frameHeight: 65
        },
        damageFrames: [6, 7, 8]
    }

    run: Asset = {
        key: "assets/images/Red_witch/R_witch_run.png",
        path: "assets/images/Red_witch/R_witch_run.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 64

        }
    }

    idle: Asset = {
        key: "assets/images/Red_witch/R_witch_idle.png",
        path: "assets/images/Red_witch/R_witch_idle.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 64

        }
    }
}
class Stage {
    static ground: Asset = {
        key: "assets/images/ground.png",
        path: "assets/images/ground.png",
        frameConfig: undefined
    }
}

export {
    Asset,
    CharacterAsset,
    BlueWitch,
    RedWitch,
    Stage
}