import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor() {
    this.hp = 100; // 초기 체력
    this.maxHp = 100; // 최대 체력
    this.attackPower = 10; // 초기 공격력
    this.stage = 1; // 초기 스테이지
    this.magicUses = 2; // 각 스테이지에서 사용할 수 있는 마법 횟수
    this.useDodge = 0;
    this.counter = 5;
  }

  getAttackPower() {
    return this.attackPower;
  }

  attack(monster) {
    const baseDamage = this.getAttackPower();
    const criticalChance = 0.3; // 크리티컬 확률 30%
    const criticalMultiplier = 1.3; // 크리티컬 배수

    const isCritical = Math.random() < criticalChance;
    const damage = isCritical ? baseDamage * criticalMultiplier : baseDamage;

    monster.hp = Math.max(0, monster.hp - Math.floor(damage)); // 소수점 제거 및 몬스터 HP가 0 이하로 떨어지지 않도록 처리
    return { damage: Math.floor(damage), isCritical }; // 소수점 제거를 위해 Math.floor 추가
  }

  useMagic(monster) {
    if (this.magicUses > 0) {
      const magicDamage = this.getAttackPower() * 2; // 마법 공격력은 공격력의 2배
      monster.hp = Math.max(0, monster.hp - Math.floor(magicDamage)); // 소수점 제거 및 몬스터 HP가 0 이하로 떨어지지 않도록 처리
      this.magicUses--; // 마법 사용 횟수 감소
      return Math.floor(magicDamage); // 소수점 제거
    } else {
      throw new Error("마법 사용 횟수를 초과했습니다.");
    }
  }

  usedodgeAndCounter(monster,player,stage) { // 회피에 성공하면 데미지를 받지않고 공격 실패하면 맞기만
    const baseDamage = this.getAttackPower();
    const dodgeChance = 0.5; //50%로 회피


    const isDodge = Math.random() < dodgeChance;
    if (isDodge) {
      // 닷지가 성공했을때 플레이어가 데미지를 받지 않고 공격한다.
      const damage = baseDamage;
      monster.hp = Math.max(0, monster.hp - Math.floor(damage));
    }
    else {
      monster.attack(player,stage);

    }
  }

  levelUp() {
    this.stage += 1;
    this.maxHp += 20;
    this.hp = this.maxHp; // 레벨업 시 최대 체력으로 설정
    this.attackPower += 5;
    this.magicUses = 2; // 스테이지 업 시 마법 사용 횟수 초기화
  }

  displayStatus() {
    console.log(`Stage: ${this.stage}, Attack Power: ${this.attackPower}, HP: ${this.hp}/${this.maxHp}, Magic Uses: ${this.magicUses}`);
  }
}

class Monster {
  constructor(stage) {
    this.hp = 100 + (stage - 1) * 40; // 스테이지에 따라 몬스터 체력 증가
  }

  getAttackPower(stage) {
    const minAttackPower = Math.max(1, stage * 2 - 1);
    const maxAttackPower = stage === 1 ? 10 : stage * 5;
    return Math.floor(Math.random() * (maxAttackPower - minAttackPower + 1)) + minAttackPower;
  }

  attack(player, stage) {
    const baseDamage = this.getAttackPower(stage) + 5; // 기본 공격력
    const criticalChance = 0.3; // 크리티컬 확률 30%
    const criticalMultiplier = 1.7; // 크리티컬 배수

    const isCritical = Math.random() < criticalChance; // 크리티컬 여부 결정
    const damage = isCritical ? baseDamage * criticalMultiplier : baseDamage; // 크리티컬 히트 시 피해량 증가
    player.hp = Math.max(0, player.hp - Math.floor(damage)); // 소수점 제거 및 플레이어 HP가 0 이하로 떨어지지 않도록 처리
    return { damage: Math.floor(damage), isCritical }; // 소수점 제거를 위해 Math.floor 추가
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어 정보 (HP: ${player.hp}/${player.maxHp}, 공격력: ${player.getAttackPower()}, 마법 사용 횟수: ${player.magicUses})`,
    ) +
    chalk.redBright(
      `| 몬스터 정보 (HP: ${monster.hp}) |`,
    ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player) => {
  const monster = new Monster(stage);
  let logs = [];

  while (player.hp > 0 && monster.hp > 0) {
    //console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다.(30%확률로 크리티컬) 2. 마법을 사용한다.(공격력의 2배 공격) 3. 회피공격을 한다.(50%확률로 회피 후 타격) `,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    switch (choice) {
      case '1':
        const { damage, isCritical } = player.attack(monster);
        if (isCritical) {
          logs.push(chalk.green(`플레이어가 크리티컬 히트로 몬스터에게 ${damage}의 피해를 주었습니다.`));
        } else {
          logs.push(chalk.green(`플레이어가 몬스터에게 ${damage}의 피해를 주었습니다.`));
        }
        console.log(`몬스터의 남은 체력: ${monster.hp}`);

        if (monster.hp > 0) {
          const { damage: monsterDamage, isCritical: monsterIsCritical } = monster.attack(player, stage);
          if (monsterIsCritical) {
            logs.push(chalk.red(`몬스터가 크리티컬 히트로 플레이어에게 ${monsterDamage}의 피해를 주었습니다.`));
          } else {
            logs.push(chalk.red(`몬스터가 플레이어에게 ${monsterDamage}의 피해를 주었습니다.`));
          }
          console.log(`플레이어의 남은 체력: ${Math.floor(player.hp)}`); // 플레이어 체력 출력
        }
        break;

      case '2':
        try {
          const magicDamage = player.useMagic(monster);
          logs.push(chalk.blue(`플레이어가 마법을 사용하여 몬스터에게 ${magicDamage}의 피해를 주었습니다.`));
          console.log(`몬스터의 남은 체력: ${monster.hp}`);

          // 몬스터가 살아있다면 반격
          if (monster.hp > 0) {
            const { damage: monsterDamage, isCritical: monsterIsCritical } = monster.attack(player, stage); // 플레이어 공격
            // 크리티컬 여부에 따라 로그 추가
            if (monsterIsCritical) {
              logs.push(chalk.red(`몬스터가 크리티컬 히트로 플레이어에게 ${monsterDamage}의 피해를 주었습니다.`));
            } else {
              logs.push(chalk.red(`몬스터가 플레이어에게 ${monsterDamage}의 피해를 주었습니다.`));
            }
            console.log(`플레이어의 남은 체력: ${Math.floor(player.hp)}`); // 플레이어 체력 출력
          }

        } catch (error) {
          logs.push(chalk.yellow(error.message));
        }
        break;

      case '3':
        logs.push(chalk.blue("플레이어가 회피 후 타격을 시전합니다.")); // hp가 깎이지 않는다 - 회피
        player.usedodgeAndCounter(monster,player,stage);

        // 회피 후 타격 로직 추가 가능
        break;

      default:
        logs.push(chalk.yellow("잘못된 선택입니다. 다시 선택해주세요."));
        break;
    }
  }

  if (player.hp <= 0) {
    logs.push(chalk.red("플레이어가 패배했습니다."));
  } else if (monster.hp <= 0) {
    logs.push(chalk.green("몬스터를 처치했습니다!"));
  }

  return player.hp > 0;
};

export async function startGame() {
  //console.clear();
  let stage = 1;
  let player = new Player();

  while (true) {
    const isAlive = await battle(stage, player);

    if (!isAlive) {
      console.log(chalk.red("게임 오버!"));
      break;
    }

    player.levelUp();
    stage++;
  }

  console.log(chalk.green("게임이 종료되었습니다."));
}
