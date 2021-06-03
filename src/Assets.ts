

interface Asset {
    key: string
    path: string
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig | undefined
}

interface AttackAsset {
    damageFrames: Array<number>
}

interface CharacterAsset {
    idle: Asset
    attack: Asset
}

class BlueWitch implements CharacterAsset {
    attack: Asset & AttackAsset= {
        key: "assets/images/Blue_witch/B_witch_attack.png",
        path: "assets/images/Blue_witch/B_witch_attack.png",
        frameConfig: {
            frameWidth: 104,
            frameHeight: 46
        },
        damageFrames: [6, 7, 8]
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
    Stage
}