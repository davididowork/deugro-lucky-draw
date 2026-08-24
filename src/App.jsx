import { useState, useEffect } from "react";

const INITIAL_POOL = {
  "🏆 特等奖": 3,
  "🥇 一等奖": 10,
  "🥈 二等奖": 20,
  "🥉 三等奖": 30,
  "🎁 参与奖": 37,
};

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
  const [pool, setPool] = useState(() => {
    const saved = localStorage.getItem("prizePool");
    return saved ? JSON.parse(saved) : INITIAL_POOL;
  });
  const [resetClicks, setResetClicks] = useState(0);

  // Admin panel visibility
  const [adminVisible, setAdminVisible] = useState(false);

  useEffect(() => {
    // Listen to localStorage changes from other tabs so admin view is "real-time"
    const onStorage = (e) => {
      if (e.key === "prizePool") {
        try {
          const newPool = JSON.parse(e.newValue);
          setPool(newPool);
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleTitleClick = () => {
    setResetClicks(resetClicks + 1);
    if (resetClicks + 1 === 3) {
      if (window.confirm("确定要重置奖池吗？")) {
        const newPool = INITIAL_POOL;
        setPool(newPool);
        localStorage.setItem("prizePool", JSON.stringify(newPool));
        alert("奖池已重置");
      }
      setResetClicks(0);
    }
  };

  const submitQuiz = () => {
    let correct = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correct++;
      }
    });

    setScore(correct);
  };

  const drawPrize = () => {
    // 构建当前可用的奖池列表
    const availablePrizes = [];
    Object.entries(pool).forEach(([prize, count]) => {
      for (let i = 0; i < count; i++) {
        availablePrizes.push(prize);
      }
    });

    if (availablePrizes.length === 0) {
      setPrize("🎉 所有奖项已抽完");
      return;
    }

    // 随机选择一个奖项
    const randomIndex = Math.floor(
      Math.random() * availablePrizes.length
    );
    const selectedPrize = availablePrizes[randomIndex];

    // 更新奖池
    const newPool = { ...pool };
    newPool[selectedPrize] -= 1;
    setPool(newPool);
    localStorage.setItem("prizePool", JSON.stringify(newPool));

    setPrize(selectedPrize);
  };

  // Hidden admin button handler
  const handleAdminButtonClick = () => {
    const input = window.prompt("请输入管理员姓名：");
    if (input === "zyh") {
      setAdminVisible(true);
    } else if (input !== null) {
      alert("无效的姓名");
    }
  };

  const adminElements = (
    <>
      <button
        onClick={handleAdminButtonClick}
        title="admin"
        style={styles.hiddenAdminButton}
      />

      {adminVisible && (
        <div style={styles.adminOverlay}>
          <div style={styles.adminPanel}>
            <h3 style={{ marginTop: 0 }}>内部管理 - 奖池实时状态</h3>
            <div style={{ textAlign: "left", marginBottom: 16 }}>
              {Object.entries(pool).map(([prizeType, count]) => (
                <p key={prizeType} style={{ margin: "6px 0" }}>
                  {prizeType}: <strong>{count}</strong>
                </p>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={styles.button}
                onClick={() => setAdminVisible(false)}
              >
                关闭
              </button>
              <button
                style={{ ...styles.button, backgroundColor: "#ef4444" }}
                onClick={() => {
                  if (window.confirm("确定要重置奖池为初始值吗？")) {
                    setPool(INITIAL_POOL);
                    localStorage.setItem("prizePool", JSON.stringify(INITIAL_POOL));
                  }
                }}
              >
                重置奖池
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (!started) {
    return (
      <div style={styles.container}>
        <h1 style={{ cursor: "pointer" }} onClick={handleTitleClick}>🎉 问答抽奖</h1>

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

            // 特殊测试用户
            if (name.toLowerCase() === "davidido") {
              const newPool = INITIAL_POOL;
              setPool(newPool);
              localStorage.setItem("prizePool", JSON.stringify(newPool));
              console.log("✨ 奖池已重置");
            }

            setStarted(true);
          }}
        >
          开始答题
        </button>

        {adminElements}
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
              <label
                key={option}
                style={styles.option}
              >
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
                />

                {" "}
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

        {adminElements}
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
            >
              开始抽奖
            </button>
          )}

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
              <div style={styles.poolStatus}>
                <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>📊 奖池剩余情况</p>
                <div style={{ textAlign: "left" }}>
                  {Object.entries(pool).map(([prizeType, count]) => (
                    <p key={prizeType} style={{ fontSize: "13px", margin: "5px 0" }}>
                      {prizeType}: <span style={{ color: count > 0 ? "#10b981" : "#ef4444" }}>{count}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p style={{ color: "red" }}>
          ❌ 答对至少2题才能抽���
        </p>
      )}

      {adminElements}
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

  // hidden small square admin button
  hiddenAdminButton: {
    position: "fixed",
    left: 12,
    bottom: 12,
    width: 34,
    height: 34,
    backgroundColor: "#999",
    opacity: 0.18,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    zIndex: 9999,
  },

  adminOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },

  adminPanel: {
    width: 320,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
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

  poolStatus: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#e0f2fe",
    borderLeft: "4px solid #0284c7",
    borderRadius: "4px",
    textAlign: "left",
  },
};
