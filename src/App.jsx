import { useState } from "react";

const questions = [
  {
    question: "deugro成立于哪一年？",
    options: ["1980", "1990", "2000", "2010"],
    answer: "1980",
  },
  {
    question: "亚洲区总部在哪？",
    options: ["上海", "香港", "新加坡", "东京"],
    answer: "上海",
  },
  {
    question: "本次活动主题是什么？",
    options: ["生命科学", "物流", "安全", "ESG"],
    answer: "生命科学",
  },
];

const prizePool = [
  ...Array(3).fill("🏆 特等奖"),
  ...Array(10).fill("🥇 一等奖"),
  ...Array(20).fill("🥈 二等奖"),
  ...Array(30).fill("🥉 三等奖"),
  ...Array(100).fill("🎁 参与奖"),
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
    const randomIndex = Math.floor(
      Math.random() * prizePool.length
    );

    setPrize(prizePool[randomIndex]);
  };

  if (!started) {
    return (
      <div style={container}>
        <h1>🎉 问答抽奖</h1>

        <input
          value={name}
          placeholder="请输入姓名"
          onChange={(e) => setName(e.target.value)}
          style={input}
        />

        <br />

        <button
          style={button}
          onClick={() => {
            if (!name.trim()) {
              alert("请输入姓名");
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
          <div key={index} style={card}>
            <h3>
              {index + 1}. {q.question}
            </h3>

            {q.options.map((option) => (
              <div key={option}>
                <label>
                  <input
                    type="radio"
                    name={`q-${index}`}
                    value={option}
                    onChange={() =>
                      setAnswers({
                        ...answers,
                        option,
                      })
                    }
                  />
                  {" "}
                  {option}
                </label>
              </div>
            ))}
          </div>
        ))}

        <button style={button} onClick={submitQuiz}>
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
        得分：{score}/3
      </h2>

      {score >= 2 ? (
        <>
          <h3 style={{ color: "green" }}>
            ✅ 获得抽奖资格
          </h3>

          {!prize && (
            <button style={button} onClick={drawPrize}>
              立即抽奖
            </button>
          )}

          {prize && (
            <div style={result}>
              <h1>{prize}</h1>
            </div>
          )}
        </>
      ) : (
        <h3 style={{ color: "red" }}>
          ❌ 需答对2题才能抽奖
        </h3>
      )}
    </div>
  );
}

const container = {
  maxWidth: "800px",
  margin: "40px auto",
  padding: "20px",
  fontFamily: "Arial",
  textAlign: "center",
};

const card = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "15px",
  textAlign: "left",
};

const input = {
  padding: "10px",
  width: "250px",
};

const button = {
  marginTop: "20px",
  padding: "12px 24px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const result = {
  marginTop: "30px",
  padding: "20px",
  background: "#f3f4f6",
  borderRadius: "10px",
};