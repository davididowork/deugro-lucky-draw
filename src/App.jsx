import { useState } from "react";

const questions = [
  {
    question: "Copilot 属于哪个公司？",
    options: ["Google", "Microsoft", "Apple", "Meta"],
    answer: "Microsoft",
  },
  {
    question: "GitHub Copilot 主要用于什么？",
    options: ["视频剪辑", "编程辅助", "财务报销", "邮件发送"],
    answer: "编程辅助",
  },
  {
    question: "React 是什么？",
    options: ["前端框架", "数据库", "操作系统", "浏览器"],
    answer: "前端框架",
  },
];

export default function App() {
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [prize, setPrize] = useState("");

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
    const random = Math.random() * 100;

    if (random < 5) {
      setPrize("🏆 特等奖");
    } else if (random < 30) {
      setPrize("🥇 一等奖");
    } else {
      setPrize("🥈 二等奖");
    }
  };

  if (!started) {
    return (
      <div style={container}>
        <h1>🎉 问答抽奖</h1>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入姓名"
          style={inputStyle}
        />

        <br />

        <button
          style={buttonStyle}
          onClick={() => {
            if (!name.trim()) {
              alert("请先输入姓名");
              return;
            }
            setStarted(true);
          }}
        >
          开始答题
        </button>
      </div>
    );
  }

  if (score === null) {
    return (
      <div style={container}>
        <h1>📋 答题环节</h1>

        {questions.map((q, index) => (
          <div key={index} style={cardStyle}>
            <h3>
              {index + 1}. {q.question}
            </h3>

            {q.options.map((option) => (
              <div key={option}>
                <label>
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={option}
                    onChange={() =>
                      setAnswers({
                        ...answers,
                        option,
                      })
                    }
                  />
                  {"  "}
                  {option}
                </label>
              </div>
            ))}
          </div>
        ))}

        <button style={buttonStyle} onClick={submitQuiz}>
          提交答案
        </button>
      </div>
    );
  }

  return (
    <div style={container}>
      <h1>🎯 答题结果</h1>

      <h2>{name}</h2>

      <h2>
        得分：{score}/{questions.length}
      </h2>

      {score >= 2 ? (
        <>
          <p style={{ color: "green", fontSize: "20px" }}>
            ✅ 恭喜获得抽奖资格
          </p>

          {!prize && (
            <button style={buttonStyle} onClick={drawPrize}>
              开始抽奖
            </button>
          )}

          {prize && (
            <div style={resultStyle}>
              <h1>{prize}</h1>
            </div>
          )}
        </>
      ) : (
        <p style={{ color: "red", fontSize: "20px" }}>
          ❌ 未达到抽奖要求（至少答对2题）
        </p>
      )}
    </div>
  );
}

const container = {
  maxWidth: "700px",
  margin: "40px auto",
  padding: "20px",
  textAlign: "center",
  fontFamily: "Arial",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "15px",
  textAlign: "left",
};

const inputStyle = {
  padding: "10px",
  width: "250px",
  marginBottom: "20px",
};

const buttonStyle = {
  padding: "12px 24px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const resultStyle = {
  marginTop: "20px",
  padding: "20px",
  background: "#f3f4f6",
  borderRadius: "10px",
};