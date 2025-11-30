import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { useCardStore } from '../store/cardStore'
import './BusinessCardWallet.css'

const imgIcon = "https://www.figma.com/api/mcp/asset/d56d758a-c7b8-42c8-bd08-19709b82a5d6"

// 명함 디자인 맵
const cardDesigns = {
  'design-1': 'linear-gradient(147.99deg, rgba(109, 48, 223, 1) 0%, rgba(88, 76, 220, 1) 100%)',
  'design-2': 'linear-gradient(147.99deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)',
  'design-3': 'linear-gradient(147.99deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)',
  'design-4': 'linear-gradient(147.99deg, rgba(236, 72, 153, 1) 0%, rgba(219, 39, 119, 1) 100%)',
  'design-5': 'linear-gradient(147.99deg, rgba(249, 115, 22, 1) 0%, rgba(234, 88, 12, 1) 100%)',
  'design-6': 'linear-gradient(147.99deg, rgba(99, 102, 241, 1) 0%, rgba(79, 70, 229, 1) 100%)',
}

function BusinessCardWallet() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [flippingCardId, setFlippingCardId] = useState(null)
  const [isGridView, setIsGridView] = useState(false)
  const cards = useCardStore((state) => state.cards)

  // 검색 필터링
  const filteredCards = cards.filter(card => {
    const query = searchQuery.toLowerCase()
    return (
      card.company?.toLowerCase().includes(query) ||
      card.position?.toLowerCase().includes(query) ||
      card.name?.toLowerCase().includes(query)
    )
  })

  const currentCard = filteredCards[currentIndex] || filteredCards[0]

  // location.state에서 openCardId 또는 selectCardId를 확인하고 처리
  useEffect(() => {
    const openCardId = location.state?.openCardId
    const selectCardId = location.state?.selectCardId
    
    if (filteredCards.length > 0) {
      // openCardId가 있으면 모달 열기
      if (openCardId) {
        const cardIndex = filteredCards.findIndex(card => card.id === openCardId)
        if (cardIndex !== -1) {
          setCurrentIndex(cardIndex)
          // 애니메이션 없이 바로 모달 열기
          setTimeout(() => {
            setShowDetailModal(true)
          }, 100)
          // state 초기화 (뒤로가기 시 다시 열리지 않도록)
          navigate(location.pathname, { replace: true, state: {} })
        }
      }
      // selectCardId가 있으면 해당 명함으로 인덱스만 변경
      else if (selectCardId) {
        const cardIndex = filteredCards.findIndex(card => card.id === selectCardId)
        if (cardIndex !== -1) {
          setCurrentIndex(cardIndex)
          // state 초기화
          navigate(location.pathname, { replace: true, state: {} })
        }
      }
    }
  }, [location.state, filteredCards, navigate, location.pathname])

  const handlePrev = () => {
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? filteredCards.length - 1 : prev - 1))
    }
  }

  const handleNext = () => {
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev === filteredCards.length - 1 ? 0 : prev + 1))
    }
  }

  const handleConfirmCard = () => {
    if (currentCard) {
      handleCardClick(currentCard.id)
    }
  }

  const handleCardClick = (cardId) => {
    setFlippingCardId(cardId)
    setIsFlipping(true)
    
    // 뒤집기 애니메이션 후 모달 표시
    setTimeout(() => {
      setShowDetailModal(true)
      setIsFlipping(false)
    }, 600) // 애니메이션 시간과 맞춤
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setFlippingCardId(null)
  }

  const handleEditInfo = () => {
    if (currentCard) {
      // Navigate to add page with card as draft for editing
      navigate('/add', { state: { draft: currentCard } })
    }
  }

  return (
    <div className="business-card-wallet">
      <div className="wallet-container">
        {/* Header Section */}
        <div className="wallet-header">
          <div className="header-content">
            <div className="header-instruction">
              <p>명함을 찾아서</p>
              <p>내용을 수정할 수 있어요.</p>
            </div>
            <div className="header-actions">
              <button 
                className="header-action-btn"
                onClick={() => navigate('/add')}
              >
                <span className="action-icon">📝</span>
                <span className="action-label">수동 명함 등록</span>
              </button>
              <button 
                className="header-action-btn"
                onClick={() => navigate('/ocr')}
              >
                <span className="action-icon">📷</span>
                <span className="action-label">OCR로 명함 추가</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-wrapper">
            <img src={imgIcon} alt="search" className="search-icon" />
            <input
              type="text"
              placeholder="회사명, 직책 등을 검색하세요"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentIndex(0)
              }}
              className="search-input"
            />
          </div>
        </div>

        {/* Business Card Display */}
        {filteredCards.length > 0 ? (
          <div className="card-carousel-section">
            {!isGridView ? (
              <>
                <div className="carousel-container">
                  <button 
                    className="carousel-nav-btn carousel-nav-prev"
                    onClick={handlePrev}
                    aria-label="Previous card"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <div className="carousel-wrapper">
                    <div className="carousel-track">
                      {filteredCards.map((card, index) => {
                        const offset = index - currentIndex
                        const isActive = index === currentIndex
                        const isVisible = Math.abs(offset) <= 1
                        
                        if (!isVisible) return null
                        
                        return (
                          <div 
                            key={card.id} 
                            className={`carousel-card ${isActive ? 'active' : ''} ${flippingCardId === card.id && isFlipping ? 'flipping' : ''}`}
                            style={{
                              transform: `translateX(${offset * 85}%) scale(${isActive ? 1 : 0.7})`,
                              opacity: isActive ? 1 : 0.3,
                              filter: isActive ? 'blur(0)' : 'blur(3px)',
                              zIndex: isActive ? 10 : 5 - Math.abs(offset)
                            }}
                            onClick={() => isActive && handleCardClick(card.id)}
                          >
                            <div 
                              className="business-card-display"
                              style={{
                                background: card.design && cardDesigns[card.design] 
                                  ? cardDesigns[card.design] 
                                  : cardDesigns['design-1']
                              }}
                            >
                              <div className="card-display-content">
                                {card.company && <p className="card-company">{card.company}</p>}
                                <div className="card-info-section">
                                  <div>
                                    <h3 className="card-name">{card.name}</h3>
                                    {card.position && <p className="card-position">{card.position}</p>}
                                  </div>
                                  <div className="card-contact">
                                    {card.phone && <p className="card-phone">{card.phone}</p>}
                                    {card.email && <p className="card-email">{card.email}</p>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <button 
                    className="carousel-nav-btn carousel-nav-next"
                    onClick={handleNext}
                    aria-label="Next card"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="card-actions">
                  <button 
                    className="action-btn action-btn-primary"
                    onClick={handleConfirmCard}
                  >
                    명함 확인하기
                  </button>
                  <button 
                    className="action-btn action-btn-secondary"
                    onClick={handleEditInfo}
                  >
                    정보 수정
                  </button>
                </div>
              </>
            ) : (
              <div className="cards-grid">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className="grid-card-item"
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div 
                      className="grid-business-card"
                      style={{
                        background: card.design && cardDesigns[card.design] 
                          ? cardDesigns[card.design] 
                          : cardDesigns['design-1']
                      }}
                    >
                      <div className="grid-card-content">
                        {card.company && <p className="grid-card-company">{card.company}</p>}
                        <div className="grid-card-info">
                          <div>
                            <h3 className="grid-card-name">{card.name}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View Toggle Button */}
            <div className="view-all-section">
              <button 
                className="view-all-btn"
                onClick={() => setIsGridView(!isGridView)}
              >
                {isGridView ? '슬라이드로 보기' : '전체 펼쳐보기'}
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-message">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* Footer Message */}
        <div className="wallet-footer">
          <div className="usage-indicator">
            <span className="usage-count">{cards.length}/200</span>
          </div>
          <p className="footer-text">더 많은 명함을 저장해 관리하세요</p>
          <a href="#" className="upgrade-link">gpt-4b+ 살펴보기</a>
        </div>
      </div>

      <BottomNavigation />

      {/* Card Detail Modal */}
      {showDetailModal && currentCard && (
        <CardDetailModal 
          card={currentCard} 
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

// Card Detail Modal Component
function CardDetailModal({ card, onClose }) {
  const [memo, setMemo] = useState(card.memo || '')
  const navigate = useNavigate()
  const updateCard = useCardStore((state) => state.updateCard)

  const handleSaveMemo = () => {
    updateCard(card.id, { memo })
  }

  const handleCustomize = () => {
    navigate('/customize', { state: { card } })
  }

  const handleCall = () => {
    if (card.phone) {
      window.location.href = `tel:${card.phone.replace(/-/g, '')}`
    }
  }

  const handleEmail = () => {
    if (card.email) {
      window.location.href = `mailto:${card.email}`
    }
  }

  const handleGiftHistory = () => {
    // 해당 명함의 선물 히스토리 페이지로 이동
    navigate('/card/gift-history', { state: { card } })
  }

  return (
    <div className="card-detail-modal-overlay" onClick={onClose}>
      <div className="card-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top Navigation */}
        <div className="modal-top-nav">
          <button className="modal-back-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="modal-top-right">
            <button className="modal-share-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="#1f2937"/>
              </svg>
            </button>
            <button className="modal-customize-button" onClick={handleCustomize}>
              명함 커스텀하기
            </button>
          </div>
        </div>

        {/* Main Card Info */}
        <div className="modal-main-card">
          <div className="modal-profile-section">
            <div className="modal-profile-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
                <path d="M20 12C21.6569 12 23 13.3431 23 15C23 16.6569 21.6569 18 20 18C18.3431 18 17 16.6569 17 15C17 13.3431 18.3431 12 20 12Z" fill="#9CA3AF"/>
                <path d="M14 26C14 23.2386 16.2386 21 19 21H21C23.7614 21 26 23.2386 26 26V28H14V26Z" fill="#9CA3AF"/>
              </svg>
            </div>
            <div className="modal-profile-info">
              <h2 
                className="modal-profile-name"
                style={{
                  background: card.design && cardDesigns[card.design] 
                    ? cardDesigns[card.design] 
                    : cardDesigns['design-1'],
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {card.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Gift History Button */}
        <button className="modal-gift-history-button" onClick={handleGiftHistory}>
          <span className="gift-history-icon">📅</span>
          <span className="gift-history-text">선물 히스토리</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Business Card Information Section */}
        <div className="modal-info-section">
          <h3 className="modal-info-title">명함 정보</h3>
          <div className="modal-info-card">
            {/* Position/Department */}
            <div className="modal-info-row">
              <span className="info-icon">💼</span>
              <div className="info-content">
                <span className="info-label">직급 / 부서</span>
                <span className="info-value">
                  {card.position && card.company ? `${card.position} / ${card.company}` : card.position || card.company || '-'}
                </span>
              </div>
            </div>
            <div className="info-divider"></div>

            {/* Phone Number */}
            {card.phone && (
              <>
                <div className="modal-info-row">
                  <span className="info-icon">📞</span>
                  <div className="info-content">
                    <span className="info-label">전화번호</span>
                    <span className="info-value">{card.phone}</span>
                  </div>
                  <button className="info-action-button" onClick={handleCall}>전화</button>
                </div>
                <div className="info-divider"></div>
              </>
            )}

            {/* Email */}
            {card.email && (
              <>
                <div className="modal-info-row">
                  <span className="info-icon">✉️</span>
                  <div className="info-content">
                    <span className="info-label">이메일</span>
                    <span className="info-value">{card.email}</span>
                  </div>
                  <button className="info-action-button" onClick={handleEmail}>메일</button>
                </div>
                <div className="info-divider"></div>
              </>
            )}

            {/* Memo */}
            <div className="modal-info-row">
              <span className="info-icon">🗒️</span>
              <div className="info-content info-content-memo">
                <span className="info-label">메모</span>
                <textarea
                  className="modal-memo-input"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  onBlur={handleSaveMemo}
                  placeholder="메모를 입력하세요"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessCardWallet

