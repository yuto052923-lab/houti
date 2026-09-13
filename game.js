// 効果音を鳴らすためのオーディオコンテキスト
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 効果音再生関数 (周波数, 音の種類, 鳴らす時間)
function playSound(freq = 440, type = 'sine', duration = 0.1) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
    osc.frequency.value = freq;

    // 音量の減衰（プチッというノイズを防ぐ処理）
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

window.addEventListener("DOMContentLoaded", () => {
    start();
});

function start() {
    // 1. 変数の初期化
    resource = new Decimal(0);
    incomeByHand = new Decimal(1);

    // 2. ジェネレーター配列を初期状態に復元
    generators = firstgenerators.map(g => ({
        ...g,
        duration: g.duration,
        production: new Decimal(g.production),
        cost: new Decimal(g.cost)
    }));

    // 3. アップグレードテーブルのリセット
    document.querySelectorAll("#upgrades-list tr").forEach(row => {
        let countEl = row.querySelector(".updates-count");
        let costEl = row.querySelector(".updates-cost");
        let effectBeforeEl = row.querySelector(".effect-before");
        let effectAfterEl = row.querySelector(".effect-after");

        if (countEl) countEl.textContent = "0";

        let type = row.dataset.type;
        if (type === "hand") {
            if (costEl) {
                costEl.dataset.rawCost = "10";
                costEl.textContent = "10";
            }
            if (effectBeforeEl) effectBeforeEl.textContent = "1";
            if (effectAfterEl) effectAfterEl.textContent = "2";
        } else if (type === "generators") {
            let genId = row.dataset.generatorId;
            let fg = firstgenerators.find(g => g.id == genId);
            if (fg) {
                if (costEl) {
                    costEl.dataset.rawCost = fg.cost.toString();
                    costEl.textContent = format(fg.cost);
                }
                if (effectBeforeEl) effectBeforeEl.textContent = "0";
                if (effectAfterEl) effectAfterEl.textContent = format(fg.production);
            }
        }
    });

    // 4. メインテーブルの進捗バーとレベル表示を初期化
    document.querySelectorAll(".gen-progress").forEach(p => p.value = 0);
    document.querySelectorAll(".gen-level").forEach(l => l.textContent = "0");

    updateUI();
}

let resource = new Decimal(0);
let ip = new Decimal(0);
let incomeByHand = new Decimal(1);
let IsBreakedInfinity = false;
let exponental = new Decimal(1);
let ipProdMult = new Decimal(1);
let ipSpeedMult = new Decimal(1);
hasUnlockedInfinity = false; // Infinityタブの解放状態を追跡するフラグ
// ジェネレーターのマスターデータ
let generators = [
  { id: 1, duration: 2000, costMult: 2, production: new Decimal(1) },
  { id: 2, duration: 5000, costMult: 3, production: new Decimal(10) },
  { id: 3, duration: 10000, costMult: 5, production: new Decimal(1000) },
  { id: 4, duration: 20000, costMult: 10, production: new Decimal("1e6") },
  { id: 5, duration: 60000, costMult: 100, production: new Decimal("1e12") },
  { id: 6, duration: 80000, costMult: 1000, production: new Decimal("1e22") },
  { id: 7, duration: 120000, costMult: 10000, production: new Decimal("1e32") },
  { id: 8, duration: 160000, costMult: 100000, production: new Decimal("1e50") },
  { id: 9, duration: 200000, costMult: 1000000, production: new Decimal("1e100") },
];
// 初期コストも含めたデータ構造（htmlの表示と統一）
const firstgenerators = [
  { id: 1, duration: 2000, costMult: 2, cost: new Decimal(10), production: new Decimal(1) },
  { id: 2, duration: 5000, costMult: 3, cost: new Decimal(100), production: new Decimal(10) },
  { id: 3, duration: 10000, costMult: 5, cost: new Decimal(1000), production: new Decimal(1000) },
  { id: 4, duration: 20000, costMult: 10, cost: new Decimal(100000), production: new Decimal("1e6") },
  { id: 5, duration: 60000, costMult: 100, cost: new Decimal("1e10"), production: new Decimal("1e12") },
  { id: 6, duration: 80000, costMult: 1000, cost: new Decimal("1e20"), production: new Decimal("1e22") },
  { id: 7, duration: 120000, costMult: 10000, cost: new Decimal("1e30"), production: new Decimal("1e32") },
  { id: 8, duration: 160000, costMult: 100000, cost: new Decimal("1e50"), production: new Decimal("1e50") },
  { id: 9, duration: 200000, costMult: 1000000, cost: new Decimal("1e100"), production: new Decimal("1e100") },
];
// 初期コストも含めたデータ構造（htmlの表示と統一）
const ipUpgrades = [
  { id: 1, duration: 2000, costMult: 2, cost: new Decimal(1), production: new Decimal(1) },
  { id: 2, duration: 5000, costMult: 3, cost: new Decimal(10), production: new Decimal(10) },
  { id: 3, duration: 10000, costMult: 5, cost: new Decimal(100), production: new Decimal(1000) },
  { id: 4, duration: 20000, costMult: 10, cost: new Decimal(10000), production: new Decimal("1e6") },
  { id: 5, duration: 60000, costMult: 100, cost: new Decimal("1e10"), production: new Decimal("1e12") },
  { id: 6, duration: 80000, costMult: 1000, cost: new Decimal("1e20"), production: new Decimal("1e22") },
  { id: 7, duration: 120000, costMult: 10000, cost: new Decimal("1e30"), production: new Decimal("1e32") },
  { id: 8, duration: 160000, costMult: 100000, cost: new Decimal("1e50"), production: new Decimal("1e50") },
  { id: 9, duration: 200000, costMult: 1000000, cost: new Decimal("1e100"), production: new Decimal("1e100") },
];

// メインゲームループ（100msごとに実行）
function gameLoop() {
    generators.forEach(gen => {
        // アップグレードテーブルから該当ジェネレーターの購入数をレベルとして取得
        let upgradeRow = document.querySelector(`#upgrades-list tr[data-generator-id='${gen.id}']`);
        let currentLevel = 0;
        
        if (upgradeRow) {
            let countEl = upgradeRow.querySelector(".updates-count");
            if (countEl) currentLevel = Number(countEl.textContent) || 0;
        }

        // メインテーブル側のレベル表示を更新
        let levelSpan = document.querySelector(`#generators-list span.gen-level[data-generator-id='${gen.id}']`);
        if (levelSpan) levelSpan.textContent = currentLevel;

        // レベルが1以上の場合のみ進捗を進める
        if (currentLevel > 0) {
            let progressBar = document.querySelector(`#generators-list progress[data-generator-id='${gen.id}']`);
            if (progressBar) {
                let currentVal = new Decimal(progressBar.value) || new Decimal(0);
                let increment = new Decimal(100 / gen.duration).times(100).times(ipSpeedMult); // 100msごとの進捗
                let cycleTime = new Decimal(gen.duration).div(100); // 100msごとのサイクル数
                let newVal = currentVal.plus(increment);
                if (newVal.gte(100)) {
                    // 100を超えた周回数を計算（超高速化に対応）
                    let cycles = Math.floor(newVal.div(100));
    
                    // 超えた分の端数だけ残して次の周へ
                    newVal = newVal.mod(100);
                    
                    // 達成した周波数分だけ資源を加算
                    let reward = gen.production.times(ipProdMult).times(cycles);
                    resource = resource.plus(reward);

                    playSound(440 * Math.pow(2, gen.id / 12), 'sine', 0.1);
                }
                // if (newVal >= 100) {
                //     newVal = 0;
                //     // 資源獲得 (生産量 × レベル)
                //     let reward = gen.production.times(ipProdMult);
                //     resource = resource.plus(reward);
                //     // 効果音を追加（440Hz = ラの音, 正弦波, 0.1秒）
                //     playSound(440*(2**(1/12)**(gen.id)), 'sine', 0.1);
                // }
                progressBar.value = newVal;
            }
        }
    });

    // カンスト制限
    if (resource.gt("1.8e308") && !IsBreakedInfinity) {
        resource = new Decimal("1.8e308");
        infinity();
    }
    if(IsBreakedInfinity){
        document.getElementById("infinity-button").style.display = "inline-block";
    } else {
        document.getElementById("infinity-button").style.display = "none";
    }

    updateUI();
}

function updateUI() {
    document.getElementById("resource-count").textContent = format(resource.floor());
    document.getElementById("resource-rate").textContent = format(incomeByHand);
    document.getElementById("ip-count").textContent = format(ip);

    // Infinityタブ内のIP表示も更新
    let tabIpCount = document.getElementById("infinity-tab-ip-count");
    if (tabIpCount) tabIpCount.textContent = format(ip);

    // Infinityタブの解放チェック
    if (!hasUnlockedInfinity && (resource.gte("1.8e308") || ip.gt(0))) {
        hasUnlockedInfinity = true;
    }

    let infinityTabBtn = document.getElementById("infinity-tab-button");
    if (infinityTabBtn) {
        if (hasUnlockedInfinity) {
            infinityTabBtn.style.display = "inline-block"; // タブを表示
            infinityTabBtn.classList.remove("locked");
        } else {
            infinityTabBtn.style.display = "none"; // 到達前は非表示
            infinityTabBtn.classList.add("locked");
        }
    }

    // IPアップグレードのボタン更新処理...
    let ipButtons = document.querySelectorAll("#ip-upgrades-list .updates-purchase > button");
    ipButtons.forEach(button => {
        let row = button.closest("tr");
        if (!row) return;
        let costEl = row.querySelector(".updates-cost");
        if (costEl) {
            let rawCost = costEl.dataset.rawCost || "1";
            let currentCost = new Decimal(rawCost);
            button.disabled = !ip.gte(currentCost);
            button.classList.toggle("distabled_button", ip.lt(currentCost));
        }
    });

    // 購入ボタンの判定処理
    let buttons = document.querySelectorAll(".updates-purchase > button");
    buttons.forEach(button => {
        let row = button.closest("tr");
        if (!row) return;
        if (row.closest("#ip-upgrades-list")) return; // IPアップグレードのボタンは除外

        let costEl = row.querySelector(".updates-cost");
        if (costEl) {
            let rawCost = costEl.dataset.rawCost || costEl.textContent;
            let currentCost = new Decimal(rawCost);
            
            // 所持金がコスト未満ならボタンを無効化
            button.disabled = resource.lt(currentCost);
            button.classList.toggle("distabled_button", resource.lt(currentCost));
        }
    });
    let infinityProgress = document.getElementById("infinity-meter")?.querySelector("#infinity-progress");
    let infinityProgressValue = document.getElementById("infinity-meter-value");
    let progressValue = resource.e;
    infinityProgressValue.textContent = Math.min(progressValue/308*100, 100).toFixed(2);
    infinityProgress.value = Math.min(progressValue/308*100, 100);
}

// 100msごとにループ実行
setInterval(gameLoop, 100);

function buyUpgrade(button) {
    let row = button.closest("tr");
    if (!row) return;

    let costEl = row.querySelector(".updates-cost");
    let countEl = row.querySelector(".updates-count");
    let effectBeforeEl = row.querySelector(".effect-before");
    let effectAfterEl = row.querySelector(".effect-after");

    let rawCost = costEl.dataset.rawCost || costEl.textContent;
    let currentCost = new Decimal(rawCost);
    let type = row.dataset.type;

    if (resource.gte(currentCost)) {
        // コスト消費
        resource = resource.sub(currentCost);

        if (type === "hand") {
            // --- 修正箇所: 計算前にBeforeを保持 ---
            let currentHand = incomeByHand;
            let nextHand = currentHand.times(2); // 倍率は変更なし

            incomeByHand = nextHand;

            // 表示の更新（Before = 購入前, After = 購入後）
            if (effectBeforeEl) effectBeforeEl.textContent = format(currentHand);
            if (effectAfterEl) effectAfterEl.textContent = format(nextHand);
            
            let nextCost = currentCost.times(2).pow(1.001).floor();
            costEl.dataset.rawCost = nextCost.toString();
            costEl.textContent = format(nextCost);

        } else if (type === "generators") {
            let genId = row.dataset.generatorId;
            let targetGen = generators.find(g => g.id == genId);

            if (targetGen) {
                let currentGen = targetGen.duration;
                targetGen.duration = currentGen * 2 / Math.pow(2, Number(countEl.textContent));

                let nextCost = currentCost.times(targetGen.costMult).pow(1.5).floor();
                costEl.dataset.rawCost = nextCost.toString();
                costEl.textContent = format(nextCost);
                
                // --- 修正箇所: 計算前の生産量を保持 ---
                let beforeProd = targetGen.production;
                // 倍率計算式はそのまま維持
                let afterProd = beforeProd.times(2).pow(1.5).floor();
                let nextAfterProd = afterProd.times(2).pow(1.5).floor();

                // 生産量を更新
                targetGen.production = afterProd;

                // 表示の更新（Before = 今回購入後の数値, After = 次回購入後の数値）
                if (effectBeforeEl) effectBeforeEl.textContent = format(afterProd.times(ipProdMult));
                if (effectAfterEl) effectAfterEl.textContent = format(nextAfterProd.times(ipProdMult));
            }
        }

        // レベル（購入回数）の更新
        if (countEl) countEl.textContent = Number(countEl.textContent) + 1;
        // 購入成功時の効果音
        playSound(523.25, 'square', 0.15);
        updateUI();
    }
}

function buyIPUpgrade(button) {
    let row = button.closest("tr");
    if (!row) return;

    let ipId = row.dataset.ipId;
    let upg = ipUpgrades.find(u => u.id === ipId);
    if (!upg) return;

    // 確実に Decimal 型にする
    let cost = new Decimal(upg.cost);

    // IPがコスト以上あるか判定
    if (ip.gte(cost)) {
        // IP消費
        ip = ip.sub(cost);

        // カウント増加 & 次回コスト計算
        upg.count += 1;
        upg.cost = new Decimal(upg.cost).times(upg.costMult);

        // 効果適用
        if (ipId === 1) {
            ipProdMult = ipProdMult.times(2);
        } else if (ipId === 2) {
            ipSpeedMult = ipSpeedMult.times(1.5);
        }

        // 表示の更新
        let countEl = row.querySelector(".updates-count");
        let costEl = row.querySelector(".updates-cost");
        let effectBeforeEl = row.querySelector(".effect-before");
        let effectAfterEl = row.querySelector(".effect-after");

        if (countEl) countEl.textContent = upg.count;
        if (costEl) {
            costEl.dataset.rawCost = upg.cost.toString();
            costEl.textContent = format(upg.cost) + " IP";
        }

        if (ipId === "prod_mult") {
            if (effectBeforeEl) effectBeforeEl.textContent = format(ipProdMult) + "倍";
            if (effectAfterEl) effectAfterEl.textContent = format(ipProdMult.times(2)) + "倍";
        } else if (ipId === "speed_mult") {
            if (effectBeforeEl) effectBeforeEl.textContent = ipSpeedMult.toFixed(2) + "倍";
            if (effectAfterEl) effectAfterEl.textContent = (ipSpeedMult * 1.5).toFixed(2) + "倍";
        }

        playSound(600, 'triangle', 0.15);
        updateUI();
    }
}

function CollectByHand() {
    resource = resource.plus(incomeByHand);
    // 効果音を追加（800Hz, 正弦波, 0.05秒）
    playSound(800, 'sine', 0.05);
    updateUI();
}

function format(num) {
    if (!(num instanceof Decimal)) {
        num = new Decimal(num);
    }
    if (num.lt(1000)) {
        return num.floor().toString();
    }
    if (num.lt(1e6)) {
        return num.floor().toNumber().toLocaleString();
    }
    return num.toExponential(2);
}

function infinity() {
    // 資源が 1.8e308 未満なら実行しない
    if (resource.lt("1.8e308")) return;

    // IPを1追加（または資源量に応じた獲得計算）
    ip = ip.plus(1);
    playSound(440, "sawtooth", 1.0);

    // 資源と手動収入をリセット
    resource = new Decimal(0);
    incomeByHand = new Decimal(1);
    exponental = new Decimal(1);

    // ジェネレーターを初期状態にリセット
    generators = JSON.parse(JSON.stringify(firstgenerators)).map(g => ({
        ...g,
        production: new Decimal(g.production)
    }));

    // UIの表示レベルと購入回数をリセット
    document.querySelectorAll("#upgrades-list tr").forEach(row => {
        let countEl = row.querySelector(".updates-count");
        if (countEl) countEl.textContent = "0";
    });
    document.querySelectorAll(".gen-progress").forEach(p => p.value = 0);
    document.querySelectorAll(".gen-level").forEach(l => l.textContent = "0");
    hasUnlockedInfinity = true;
    start();
    updateUI();
}

function prestage() {
    

    // 資源と手動収入をリセット
    resource = new Decimal(0);
    incomeByHand = new Decimal(1);
    exponental = exponental.plus();

    // ジェネレーターを初期状態にリセット
    generators = JSON.parse(JSON.stringify(firstgenerators)).map(g => ({
        ...g,
        production: new Decimal(g.production)
    }));

    // UIの表示レベルと購入回数をリセット
    document.querySelectorAll("#upgrades-list tr").forEach(row => {
        let countEl = row.querySelector(".updates-count");
        if (countEl) countEl.textContent = "0";
    });
    document.querySelectorAll(".gen-progress").forEach(p => p.value = 0);
    document.querySelectorAll(".gen-level").forEach(l => l.textContent = "0");

    updateUI();
}