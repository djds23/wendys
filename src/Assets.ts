interface Spritesheet {
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig | undefined
}

interface Asset {
    key: string
    path: string
}

interface Attackable {
    damageFrames: Array<number>
}

type AttackAsset = Asset & Attackable

interface CharacterAsset {
    idle: Spritesheet & Asset
    run: Spritesheet & Asset
    attack: Spritesheet & AttackAsset 
    select: Spritesheet & Asset
}

class BlueWitch implements CharacterAsset {
    attack = {
        key: "assets/images/Blue_witch/B_witch_attack.png",
        path: "assets/images/Blue_witch/B_witch_attack.png",
        frameConfig: {
            frameWidth: 104,
            frameHeight: 46
        },
        damageFrames: [6, 7, 8]
    }

    run = {
        key: "assets/images/Blue_witch/B_witch_run.png",
        path: "assets/images/Blue_witch/B_witch_run.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 48

        }
    }

    idle = {
        key: "assets/images/Blue_witch/B_witch_idle.png",
        path: "assets/images/Blue_witch/B_witch_idle.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 48

        }
    }

    select = {
        key: "assets/images/Blue_witch/B_witch_emoji.png",
        path: "assets/images/Blue_witch/B_witch_emoji.png",
        frameConfig: {
            frameWidth: 50,
            frameHeight: 50
        }
    }
}

class RedWitch implements CharacterAsset {
    attack = {
        key: "assets/images/Red_witch/R_witch_attack.png",
        path: "assets/images/Red_witch/R_witch_attack.png",
        frameConfig: {
            frameWidth: 155,
            frameHeight: 65
        },
        damageFrames: [6, 7, 8]
    }

    run = {
        key: "assets/images/Red_witch/R_witch_run.png",
        path: "assets/images/Red_witch/R_witch_run.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 64

        }
    }

    idle = {
        key: "assets/images/Red_witch/R_witch_idle.png",
        path: "assets/images/Red_witch/R_witch_idle.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 64

        }
    }

    select = {
        key: "assets/images/Red_witch/R_witch_emoji.png",
        path: "assets/images/Red_witch/R_witch_emoji.png",
        frameConfig: {
            frameWidth: 50,
            frameHeight: 50
        }
    }
}

class WhiteWitch {
    attack = {
        key: "assets/images/White_witch/W_witch_attack.png",
        path: "assets/images/White_witch/W_witch_attack.png",
        frameConfig: {
            frameWidth: 104,
            frameHeight: 46
        },
        damageFrames: [6, 7, 8]
    }

    run = {
        key: "assets/images/White_witch/W_witch_run.png",
        path: "assets/images/White_witch/W_witch_run.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 48

        }
    }

    idle = {
        key: "assets/images/White_witch/W_witch_idle.png",
        path: "assets/images/White_witch/W_witch_idle.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 48

        }
    }  

    select = {
        key: "assets/images/White_witch/W_witch_emoji.png",
        path: "assets/images/White_witch/W_witch_emoji.png",
        frameConfig: {
            frameWidth: 50,
            frameHeight: 50
        }
    }
}

class Stage {
    static ground: Asset = {
        key: "assets/images/ground.png",
        path: "assets/images/ground.png",
    }
}


class CharacterSelect {
    static wand: Spritesheet & Asset = {
        key: "assets/images/witches_wand.png",
        path: "assets/images/witches_wand.png",
        frameConfig: {
            frameWidth: 30,
            frameHeight: 30
        }
    }
}

export {
    Asset,
    CharacterAsset,
    BlueWitch,
    RedWitch,
    WhiteWitch,
    Stage,
    CharacterSelect
}