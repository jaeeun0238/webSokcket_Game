import chalk from 'chalk';
import readlineSync from 'readline-sync';
//asdf
class Player {
  constructor() {
    this.hp = 100; // 초기 체력
    this.maxHp = 100; // 최대 체력
    this.mp = 100;
    this.maxMp = 100;
    this.baseAttackPower = 10; // 초기 공격력은 10으로 설정
  }

  getAttackPower(stage) {
    const minAttackPower = Math.max(1, stage * 2 - 1); // 최소 공격력
    const maxAttackPower = stage === 1 ? 10 : stage * 5; // 1스테이지에서 최대 공격력 10
    return Math.floor(Math.random() * (maxAttackPower - minAttackPower + 1)) + minAttackPower; // 범위 내 랜덤 공격력 반환
  }

  attack(monster, stage) {
    const damage = this.getAttackPower(stage); // 스테이지에 따라 공격력 계산
    monster.hp -= damage; // 몬스터의 체력 감소
    return damage; // 공격한 피해량 반환
  }

  levelUp() {
    this.maxHp += 20; // 최대 체력 증가
    this.hp = this.maxHp; // 체력을 최대값으로 회복
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
    const damage = this.getAttackPower(stage); // 스테이지에 따라 공격력 계산
    player.hp -= damage; // 플레이어의 체력 감소
    return damage; // 공격한 피해량 반환
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어 정보 (HP: ${player.hp}/${player.maxHp}, 기본 공격력: ${player.baseAttackPower})`,
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
    console.clear(); // 콘솔지우는 코드
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다 2. 아무것도 하지않는다. 3. 도망간다. 4. 회피한다. 5. 마법을 사용한다. `,
      ),
    );
    const choice = readlineSync.question('당신의 선택은? ');

    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    switch (choice) {
      case '1':
        const damage = player.attack(monster, stage); // 몬스터에게 공격
        logs.push(chalk.green(`플레이어가 몬스터에게 ${damage}의 피해를 주었습니다.`));
        console.log(`몬스터의 남은 체력: ${monster.hp}`);

        if (monster.hp > 0) {
          const monsterDamage = monster.attack(player, stage); // 플레이어에게 공격
          logs.push(chalk.red(`몬스터가 플레이어에게 ${monsterDamage}의 피해를 주었습니다.`));
          console.log(`플레이어의 남은 체력: ${player.hp}`);
        }
        break;

      case '2':
        logs.push(chalk.blue("플레이어가 아무것도 하지 않았습니다."));
        break;
        case '3':
        logs.push(chalk.blue("플레이어가 도망쳤습니다."));
        break;
        case '4':
        logs.push(chalk.blue("플레이어가 회피하였습니다."));
        break;
        case '5':
        logs.push(chalk.blue("플레이어가 마법을 사용하였습니다."));
        console.log(`플레이어의 남은 마법 사용 횟수: `);
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
  //let player2 = new Player(); // 플레이어는 한 명만 생성
  //console.log(player.hp,player2.hp);
  
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
