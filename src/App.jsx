import { useEffect, useState } from "react";
import { onValue, ref, runTransaction, set } from "firebase/database";
import { database } from "./firebase";

const INITIAL_POOL = {
  "🏆 特等奖": 1,
  "🥇 一等奖": 2,
  "🥈 二等奖": 3,
  "🥉 三等奖": 37,
  "🎁 参与奖": 57,
};
const PRIZE_ORDER = Object.keys(INITIAL_POOL);
const LOCAL_POOL_KEY = "deugro-lucky-draw-prize-pool";

const questions = [
  {
    question: "Q1. 德高集团成立于哪一年？起源于哪个国家？\nWhen and where was deugro established?",
    options: [
      "A. 1900，英国（UK）",
      "B. 1924，德国（Germany）",
      "C. 1980，美国（USA）",
      "D. 2010，新加坡（Singapore）",
    ],
    answer: "B. 1924，德国（Germany）",
  },
  {
    question: "Q2. 德高的全球业务网络覆盖多少个国家及分支机构？\nHow many countries and offices does deugro's global network span?",
    options: [
      "A. 10+ Countries / 20+ Offices",
      "B. 20+ Countries / 30+ Offices",
      "C. 30+ Countries / 50+ Offices",
      "D. 40+ Countries / 70+ Offices",
    ],
    answer: "D. 40+ Countries / 70+ Offices",
  },
  {
    question: "Q3. 以下哪项属于德高生命科学与医疗行业的核心服务？\nWhich of the following is a core service of deugro's Life Sciences & Healthcare sector?",
    options: [
      "A. 药品研发 Drug Research & Development",
      "B. 临床试验受试者招募 Clinical Trial Participant Recruitment",
      "C. 临床试验供应链管理 Clinical Trial Supply Chain Management",
      "D. 药品生产制造 Pharmaceutical Manufacturing",
    ],
    answer: "C. 临床试验供应链管理 Clinical Trial Supply Chain Management",
  },
  {
    question: "Q4. 德高临床供应链可支持的温控范围包括？\nWhich temperature ranges can be supported by deugro's clinical supply chain solutions?",
    options: [
      "A. 15-25°C",
      "B. 2-8°C",
      "C. -20°C",
      "D. 以上全部 All of the above",
    ],
    answer: "D. 以上全部 All of the above",
  },
];

export default function App() {
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [prize, setPrize] = useState("");
  const [poolLoading, setPoolLoading] = useState(Boolean(database));
  const [poolError, setPoolError] = useState("");
  const [pool, setPool] = useState(INITIAL_POOL);
  const [showPool, setShowPool] = useState(false);
  const [resettingPool, setResettingPool] = useState(false);
  const localMode = !database;

  console.log("Firebase Mode");
  console.log("database =", !!database);
  console.log("pool =", pool);

  useEffect(() => {
    if (!database) {
      let localPool = INITIAL_POOL;
      try {
        const savedPool = window.localStorage.getItem(LOCAL_POOL_KEY);
        if (savedPool) {
          const parsedPool = JSON.parse(savedPool);
          if (parsedPool && typeof parsedPool === "object") {
            localPool = { ...INITIAL_POOL, ...parsedPool };
          }
        } else {
          window.localStorage.setItem(LOCAL_POOL_KEY, JSON.stringify(INITIAL_POOL));
        }
      } catch {
        setPoolError("本地奖池无法保存，将仅在当前页面有效");
      }

      setPool(localPool);
      setPoolLoading(false);

      const handleStorage = (event) => {
        if (event.key !== LOCAL_POOL_KEY || !event.newValue) {
          return;
        }

        try {
          setPool({ ...INITIAL_POOL, ...JSON.parse(event.newValue) });
        } catch {
          setPoolError("本地奖池数据格式无效");
        }
      };

      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }

    const poolRef = ref(database, "prizePool");
    const unsubscribe = onValue(
      poolRef,
      (snapshot) => {
        const remotePool = snapshot.val();
        if (remotePool) {
          setPool(remotePool);
          setPoolError("");
        } else {
          set(poolRef, INITIAL_POOL)
            .then(() => {
              setPool(INITIAL_POOL);
              setPoolError("");
            })
            .catch((error) => {
              const message = error?.message || "未知错误";
              setPoolError(`已连接云端，但奖池为空且无写入权限：${message}`);
            });
        }
        setPoolLoading(false);
      },
      (error) => {
        const code = error?.code ? `${error.code} ` : "";
        const message = error?.message || "未知错误";
        setPoolLoading(false);
        setPoolError(`云端连接失败：${code}${message}`);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);
  const submitQuiz = () => {
    let correct = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correct++;
      }
    });

    setScore(correct);
  };

  const drawPrize = async () => {
    if (poolLoading) {
      return;
    }

    if (localMode) {
      const availablePrizes = Object.entries(pool).flatMap(([prizeType, count]) =>
        Array(Number(count) || 0).fill(prizeType)
      );
      if (availablePrizes.length === 0) {
        setPrize("🎉 所有奖项已抽完");
        return;
      }

      const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
      const nextPool = { ...pool, [selectedPrize]: Number(pool[selectedPrize]) - 1 };
      setPool(nextPool);
      setPrize(selectedPrize);
      try {
        window.localStorage.setItem(LOCAL_POOL_KEY, JSON.stringify(nextPool));
      } catch {
        setPoolError("奖池已更新，但无法保存到本地");
      }
      return;
    }

    let selectedPrize = "";
    try {
      const result = await runTransaction(ref(database, "prizePool"), (currentPool) => {
        const safePool = currentPool || INITIAL_POOL;
        const availablePrizes = Object.entries(safePool).flatMap(([prizeType, count]) =>
          Array(count).fill(prizeType)
        );
        if (availablePrizes.length === 0) {
          return;
        }

        selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
        return { ...safePool, [selectedPrize]: safePool[selectedPrize] - 1 };
      });

      if (result.committed && selectedPrize) {
        setPrize(selectedPrize);
        setPoolError("");
      } else if (!selectedPrize) {
        setPrize("🎉 所有奖项已抽完");
      } else {
        setPoolError("抽奖失败，请稍后重试");
      }
    } catch (error) {
      const code = error?.code ? `${error.code} ` : "";
      const message = error?.message || "未知错误";
      setPoolError(`抽奖失败：${code}${message}`);
    }
  };

  const resetPoolForAdmin = async () => {
    setResettingPool(true);
    try {
      if (localMode) {
        window.localStorage.setItem(LOCAL_POOL_KEY, JSON.stringify(INITIAL_POOL));
        setPool(INITIAL_POOL);
      } else {
        await set(ref(database, "prizePool"), INITIAL_POOL);
      }
      setPrize("");
      setScore(null);
      setAnswers({});
      setStarted(false);
      alert("奖池已重置");
    } catch (error) {
      const code = error?.code ? `${error.code} ` : "";
      const message = error?.message || "未知错误";
      setPoolError(`奖池重置失败：${code}${message}`);
    } finally {
      setResettingPool(false);
    }
  };

  const renderPoolControl = () => (
    <div style={styles.poolControl}>
      <button
        type="button"
        style={styles.poolToggle}
        onClick={() => setShowPool((visible) => !visible)}
      >
        {showPool ? "收回剩余奖项" : "查看剩余奖项"}
      </button>
      {showPool && (
        <div style={styles.poolPeek}>
          {Object.entries(pool)
            .sort(
              ([leftPrize], [rightPrize]) =>
                (PRIZE_ORDER.indexOf(leftPrize) + 1 || Number.MAX_SAFE_INTEGER) -
                (PRIZE_ORDER.indexOf(rightPrize) + 1 || Number.MAX_SAFE_INTEGER)
            )
            .map(([prizeType, count]) => (
            <div key={prizeType}>
              {prizeType}：{count}
            </div>
            ))}
        </div>
      )}
    </div>
  );

  if (!started) {
    return (
      <div style={styles.container}>
        <h1>
          🎉 德高问答抽奖
        </h1>

        <input
          style={styles.input}
          placeholder="请输入姓名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={() => {
            if (!name.trim()) {
              alert("请输入姓名");
              return;
            }

            if (name.trim().toLowerCase() === "davidido") {
              resetPoolForAdmin();
              return;
            }

            setStarted(true);
          }}
          disabled={resettingPool}
        >
          {resettingPool ? "正在重置奖池..." : "开始答题"}
        </button>
        {renderPoolControl()}
      </div>
    );
  }

  if (score === null) {
    return (
      <div style={styles.container}>
        <h1>📋 答题环节</h1>

        {questions.map((q, index) => (
          <div key={index} style={styles.card}>
            <h3>
              {index + 1}. {q.question}
            </h3>

            {q.options.map((option) => (
              <label key={option} style={styles.option}>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answers[index] === option}
                  onChange={() =>
                    setAnswers({
                      ...answers,
                      [index]: option,
                    })
                  }
                />{" "}
                {option}
              </label>
            ))}
          </div>
        ))}

        <button
          style={styles.button}
          onClick={submitQuiz}
        >
          提交答案
        </button>
        {renderPoolControl()}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>🎯 答题结果</h1>

      <h2>{name}</h2>

      <h3>
        得分：{score} / {questions.length}
      </h3>

      {score >= 2 ? (
        <>
          <p style={{ color: "green" }}>
            ✅ 恭喜获得抽奖资格
          </p>

          {!prize && (
            <button
              style={styles.button}
              onClick={drawPrize}
              disabled={poolLoading}
            >
              {poolLoading ? "正在准备奖池..." : "开始抽奖"}
            </button>
          )}

          {poolError && <p style={{ color: "#b45309" }}>{poolError}</p>}

          {prize && (
            <div style={styles.result}>
              <p style={{ fontSize: "18px", marginBottom: "20px" }}>🎊 恭喜你获得了 🎊</p>
              <h1 style={{ fontSize: "48px", color: "#d97706", marginBottom: "20px" }}>
                {prize}
              </h1>
              <p style={{ fontSize: "16px", color: "#666", marginBottom: "30px" }}>感谢参与本次活动！</p>
              <div style={styles.notice}>
                <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>⚠️ 请重要提示</p>
                <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
                  请将您的中奖结果展示给工作人员进行确认和领奖
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <p style={{ color: "red" }}>
          ❌ 答对至少2题才能抽奖
        </p>
      )}
      {renderPoolControl()}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    textAlign: "center",
    fontFamily: "Arial",
  },

  card: {
    border: "1px solid #dddddd",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    textAlign: "left",
  },

  option: {
    display: "block",
    marginTop: "10px",
  },

  input: {
    width: "250px",
    padding: "10px",
    marginBottom: "20px",
  },

  button: {
    padding: "12px 24px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  poolControl: {
    marginTop: "36px",
    textAlign: "center",
  },

  poolToggle: {
    padding: "4px 8px",
    backgroundColor: "#e5e7eb",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
  },

  poolPeek: {
    margin: "8px auto 0",
    padding: "8px 12px",
    maxWidth: "220px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    color: "#4b5563",
    fontSize: "12px",
    lineHeight: "1.8",
    textAlign: "left",
  },

  result: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
  },

  notice: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#fef3c7",
    borderLeft: "4px solid #f59e0b",
    borderRadius: "4px",
    textAlign: "left",
  },

};
