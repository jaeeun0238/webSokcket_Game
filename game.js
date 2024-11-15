import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor() {
    this.hp = 100; // 초기 체력
    this.maxHp = 100; // 최대 체력
    this.mp = 100; // 초기 마법력
    this.maxMp = 100; // 최대 마법력
    this.attackPower = 10; // 초기 공격력
    this.stage = 1; // 초기 스테이지
  }

  getAttackPower() {
    // 스테이지에 따라 공격력을 계산
    return this.attackPower;
  }

  attack(monster) {
    const baseDamage = this.getAttackPower(); // 현재 공격력 계산
    const criticalChance = 0.3; // 크리티컬 확률 30%
    const criticalMultiplier = 1.3; // 크리티컬 배수

    // 랜덤 값 생성하여 크리티컬 여부 결정
    const isCritical = Math.random() < criticalChance;
    const damage = isCritical ? baseDamage * criticalMultiplier : baseDamage; // 크리티컬 히트 시 피해량 증가

    monster.hp -= damage; // 몬스터의 체력 감소
    return { damage, isCritical }; // 공격한 피해량과 크리티컬 여부 반환
  }

  levelUp() {
    this.stage += 1; // 스테이지 증가
    this.maxHp += 20; // 최대 체력 증가
    this.hp = this.maxHp; // 체력을 최대값으로 회복
    this.attackPower += 5; // 공격력을 5 증가
  }

  displayStatus() {
    console.log(`Stage: ${this.stage}, Attack Power: ${this.attackPower}, HP: ${this.hp}/${this.maxHp}`);
  }
}


class Monster {
  constructor(stage) {
    this.hp = 100 + (stage - 1) * 20; // 스테이지에 따라 몬스터 체력 증가
  }

  getAttackPower(stage) {
    const minAttackPower = Math.max(1, stage * 2 - 1); // 최소 공격력
    const maxAttackPower = stage === 1 ? 10 : stage * 5; // 1스테이지에서 최대 공격력 10
    return Math.floor(Math.random() * (maxAttackPower - minAttackPower + 1)) + minAttackPower; // 범위 내 랜덤 공격력 반환
  }

  attack(player, stage) {
    const damage = this.getAttackPower(stage)+5; // 스테이지에 따라 공격력 계산
    player.hp -= damage; // 플레이어의 체력 감소
    return damage; // 공격한 피해량 반환
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어 정보 (HP: ${player.hp}/${player.maxHp}, 공격력: ${player.getAttackPower()})`,
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
    console.clear(); // 콘솔 지우는 코드
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다(일정확률로 크리티컬발생) 2. 주문을 외운다(크리티컬확률+30%). 3. 마법을 사용한다(공격력의 2배 공격)) 4. 회피공격을한다.(30%확률로 회피후 타격) `,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    switch (choice) {
      case '1':
        const { damage, isCritical } = player.attack(monster); // 몬스터에게 공격
        if (isCritical) {
          logs.push(chalk.green(`플레이어가 크리티컬 히트로 몬스터에게 ${damage}의 피해를 주었습니다.`));
        } else {
          logs.push(chalk.green(`플레이어가 몬스터에게 ${damage}의 피해를 주었습니다.`));
        }
        console.log(`몬스터의 남은 체력: ${monster.hp}`);

        if (monster.hp > 0) {
          const monsterDamage = monster.attack(player, stage); // 플레이어에게 공격
          logs.push(chalk.red(`몬스터가 플레이어에게 ${monsterDamage}의 피해를 주었습니다.`));
          console.log(`플레이어의 남은 체력: ${player.hp}`);
        }
        break;

      case '2':
        logs.push(chalk.blue("플레이어가 주문을 외웠습니다."));
        //트리티컬 확률이 올라갔다는 로그 표시
        break;
      case '3':
        logs.push(chalk.blue("플레이어가 마법을 사용하였습니다."));
        console.log(`플레이어의 남은 마법 사용 횟수: `);
        break;
      case '4':
        logs.push(chalk.blue("플레이어가 회피후 타격을 시전합니다."));
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

  return player.hp > 0; // 플레이어가 살아있으면 true 반환
};


export async function startGame() {
  console.clear();
  let stage = 1;
  let player = new Player();

  while (true) { // 무한 루프
    const isAlive = await battle(stage, player);

    if (!isAlive) {
      console.log(chalk.red("게임 오버!"));
      break; // 플레이어가 패배하면 게임 종료
    }

    player.levelUp(); // 스테이지가 증가할 때마다 플레이어의 최대 체력 증가 및 체력 회복
    stage++; // 스테이지 증가
  }

  console.log(chalk.green("게임이 종료되었습니다."));
}
