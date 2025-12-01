import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import './LandingPage.css'

const imgGpt4B1 = "https://www.figma.com/api/mcp/asset/a3f2241c-a552-4bd3-b5e3-fa9bb210880a"
const imgImageWithFallback = "https://www.figma.com/api/mcp/asset/e61c2b5d-68eb-409e-9b25-a90abd759a96"
const imgImageWithFallback1 = "https://www.figma.com/api/mcp/asset/2fbadc50-65b5-4cb8-8a55-788f604b6dd8"
const imgImageWithFallback2 = "https://www.figma.com/api/mcp/asset/a166d192-abaa-4496-bc6a-bd5336537959"
const imgImageWithFallback3 = "https://www.figma.com/api/mcp/asset/33109928-c22e-44a9-be00-18c92d851a45"
const imgIcon = "https://www.figma.com/api/mcp/asset/dd2c3a79-4460-4073-9292-db10d6d07dab"
const imgIcon1 = "https://www.figma.com/api/mcp/asset/49a9be54-9062-4383-b3ba-bd80bcd932c2"

// 인기 선물 데이터 (랭킹 순으로 정렬)
const popularGifts = [
  {
    id: 1,
    rank: 1,
    image: imgImageWithFallback,
    title: "프리미엄 와인 세트",
    category: "주류",
    price: "150,000원",
    popularity: "인기 95%"
  },
  {
    id: 2,
    rank: 2,
    image: imgImageWithFallback1,
    title: "명품 선물 세트",
    category: "고급 선물",
    price: "300,000원",
    popularity: "인기 92%"
  },
  {
    id: 3,
    rank: 3,
    image: imgImageWithFallback2,
    title: "스페셜티 커피 세트",
    category: "식음료",
    price: "80,000원",
    popularity: "인기 88%"
  },
  {
    id: 4,
    rank: 4,
    image: imgImageWithFallback3,
    title: "비즈니스 선물 세트",
    category: "사무용품",
    price: "120,000원",
    popularity: "인기 85%"
  }
].sort((a, b) => a.rank - b.rank) // 랭킹 순으로 정렬
.slice(0, 4) // 최대 4개까지만 표시

function LandingPage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const name = localStorage.getItem('userName')
    if (name) {
      setUserName(name)
    }
  }, [])

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Header */}
        <div className="landing-header">
          <img src={imgGpt4B1} alt="GPT-4b Logo" className="header-logo" />
          {userName && (
            <span className="welcome-message">{userName}님 환영합니다!</span>
          )}
        </div>

        {/* AI Gift Recommendation Banner */}
        <div className="ai-banner">
          <div className="banner-content">
            <div className="banner-text">
              <p className="banner-subtitle">AI 맞춤형 선물 추천</p>
              <p className="banner-title">상대방의 정보를 기반으로 최적의 선물을 찾아드립니다</p>
            </div>
          </div>
        </div>

        {/* Popular Gifts Section */}
        <div className="popular-gifts-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <img src={imgIcon1} alt="gift" className="section-icon" />
              <h2 className="section-title">인기 선물</h2>
            </div>
          </div>

          <div className="gift-cards-container">
            {popularGifts.map((gift) => (
              <div key={gift.id} className="gift-card">
                <div className="gift-card-image">
                  <img src={gift.image} alt={gift.title} />
                  <div className="rank-badge">#{gift.rank}</div>
                </div>
                <div className="gift-card-content">
                  <div className="category-badge">{gift.category}</div>
                  <h3 className="gift-card-title">{gift.title}</h3>
                  <div className="gift-card-price">
                    <span className="price">{gift.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="view-all-button" onClick={() => navigate('/popular-gifts')}>전체보기</button>
        </div>

        {/* Important Alerts Section */}
        <div className="alerts-section">
          <h2 className="alerts-title">중요 알림</h2>
          <div className="alerts-list">
            <div className="alert-card">
              <div className="alert-icon">🔔</div>
              <p className="alert-text">최하늘 님과 연락한 지 90일이 지났습니다. 간단한 선물로 안부를 전해보세요.</p>
              <button className="alert-button">보기</button>
            </div>

            <div className="alert-card">
              <div className="alert-icon">🎁</div>
              <p className="alert-text">강지민 님의 생일이 5일 남았습니다. 선물을 준비해보세요.</p>
              <button className="alert-button">보기</button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default LandingPage

