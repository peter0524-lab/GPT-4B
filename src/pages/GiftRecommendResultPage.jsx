import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './GiftRecommendResultPage.css'
import { giftAPI, chatAPI } from '../utils/api.js'

// 샘플 선물 데이터 (실제로는 API에서 가져와야 함)
const sampleGifts = [
  {
    id: 1,
    name: '프리미엄 골프 클럽 세트',
    description: '최신 기술이 적용된 고급 골프 클럽',
    price: '₩850,000',
    image: 'https://www.figma.com/api/mcp/asset/e61c2b5d-68eb-409e-9b25-a90abd759a96',
    category: '스포츠'
  },
  {
    id: 2,
    name: '프랑스 프리미엄 와인 세트',
    description: '엄선된 보르도 와인 컬렉션',
    price: '₩450,000',
    image: 'https://www.figma.com/api/mcp/asset/2fbadc50-65b5-4cb8-8a55-788f604b6dd8',
    category: '주류'
  },
  {
    id: 3,
    name: '명품 골프백 세트',
    description: '프리미엄 소재의 고급 골프백',
    price: '₩320,000',
    image: 'https://www.figma.com/api/mcp/asset/a166d192-abaa-4496-bc6a-bd5336537959',
    category: '스포츠'
  }
]

function GiftRecommendResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const card = location.state?.card
  const additionalInfo = location.state?.additionalInfo || ''
  const memos = location.state?.memos || []
  const recommendedGifts = location.state?.recommendedGifts || []
  const rationaleCards = location.state?.rationaleCards || []
  const personaString = location.state?.personaString || ''
  
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [showRationale, setShowRationale] = useState(false)
  const [selectedGiftIndex, setSelectedGiftIndex] = useState(null)
  const [isSavingGift, setIsSavingGift] = useState(false)
  const [isSavingChat, setIsSavingChat] = useState(false)
  const messagesEndRef = useRef(null)

  const handleBack = () => {
    navigate(-1)
  }

  const handleViewDetails = () => {
    setShowRationale(!showRationale)
  }

  // 자동 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim()) {
      // 사용자 메시지 추가
      setMessages([...messages, { type: 'user', text: message.trim() }])
      setMessage('')
      
      // TODO: AI 응답 받기 (실제로는 API 호출)
      // 임시로 AI 응답 추가
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'ai', text: '감사합니다. 추가로 도움이 필요하시면 말씀해주세요.' }])
      }, 500)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSelectGift = async (gift, index) => {
    if (selectedGiftIndex !== null || isSavingGift) return // 이미 선택되었거나 저장 중이면 무시
    
    if (!card?.id) {
      alert('명함 정보가 없어 선물을 저장할 수 없습니다.')
      return
    }
    
    setIsSavingGift(true)
    setSelectedGiftIndex(index)

    try {
      const metadata = gift.metadata || {}
      const giftName = metadata.name || metadata.product_name || '이름 없음'
      const giftPrice = metadata.price ? parseInt(metadata.price) : null
      const giftImage = metadata.image || ''
      const giftCategory = metadata.category || '카테고리 없음'
      
      // 선물 정보를 DB에 저장
      await giftAPI.create({
        cardId: card.id,
        giftName: giftName,
        giftDescription: `${giftCategory} 카테고리의 선물`,
        giftImage: giftImage,
        price: giftPrice,
        category: giftCategory,
        notes: `선물 추천에서 선택된 선물: ${giftName}`
      })

      // 전체 대화 내역 저장
      await saveChatHistory(gift, giftName, giftPrice, giftImage, giftCategory)
    } catch (error) {
      console.error('Error saving gift:', error)
      alert(error.response?.data?.message || '선물 저장 중 오류가 발생했습니다.')
      setSelectedGiftIndex(null) // 에러 시 선택 취소
    } finally {
      setIsSavingGift(false)
    }
  }

  const saveChatHistory = async (selectedGift, giftName, giftPrice, giftImage, giftCategory) => {
    if (isSavingChat) return // 이미 저장 중이면 무시
    
    setIsSavingChat(true)

    try {
      // 대화 내역 구성
      const chatMessages = [
        {
          role: 'assistant',
          content: `안녕하세요! 👋\n${userName}님을 위한 맞춤 선물을 추천해드릴게요.`,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: `다음은 ${userName}님의 정보예요:\n- 이름: ${userName}\n${userPosition ? `- 직급: ${userPosition}\n` : ''}${userCompany ? `- 회사: ${userCompany}\n` : ''}- 관심사: ${interests}`,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: `${userName}님의 관심사를 고려하여 다음 선물들을 추천드립니다:\n\n${recommendedGifts.map((gift, idx) => {
            const meta = gift.metadata || {};
            const name = meta.name || meta.product_name || `선물 ${idx + 1}`;
            const price = meta.price ? `₩${parseInt(meta.price).toLocaleString()}` : '가격 정보 없음';
            return `${idx + 1}. ${name} (${price})`;
          }).join('\n')}`,
          timestamp: new Date().toISOString()
        },
        {
          role: 'user',
          content: `선택한 선물: ${giftName} (${giftCategory}, ${giftPrice ? `₩${giftPrice.toLocaleString()}` : '가격 정보 없음'})`,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: `선택하신 "${giftName}" 선물이 저장되었습니다.`,
          timestamp: new Date().toISOString()
        }
      ]

      // Chat 생성
      await chatAPI.createHistory(
        chatMessages,
        `${userName}님을 위한 선물 추천`,
        'gpt'
      )
    } catch (error) {
      console.error('Error saving chat history:', error)
      // 채팅 저장 실패는 사용자에게 알리지 않음 (선물 저장은 성공했으므로)
    } finally {
      setIsSavingChat(false)
    }
  }

  // 사용자 정보 추출
  const userName = card?.name || '이름 없음'
  const userPosition = card?.position || ''
  const userCompany = card?.company || ''
  const headerTitle = userPosition && userCompany 
    ? `${userName} ${userCompany} ${userPosition}`
    : `${userName}님을 위한 선물추천`

  // 관심사 추출 (메모나 추가 정보에서)
  const interests = memos.length > 0 
    ? memos.join(', ')
    : additionalInfo || '없음'

  return (
    <div className="gift-recommend-result-page">
      <div className="gift-recommend-result-container">
        {/* Header */}
        <div className="gift-result-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className="header-title">{headerTitle}</h2>
          <div style={{ width: '24px' }}></div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {/* Greeting Message */}
          <div className="message-bubble ai-message">
            <p>안녕하세요! 👋</p>
            <p>{userName}님을 위한 맞춤 선물을 추천해드릴게요.</p>
          </div>

          {/* User Info Card */}
          <div className="message-bubble ai-message">
            <p>다음은 {userName}님의 정보예요:</p>
            <div className="user-info-card">
              <div className="user-info-avatar">
                <span>{userName.charAt(0)}</span>
              </div>
              <div className="user-info-details">
                <div className="user-info-name">{userName}</div>
                {userPosition && <div className="user-info-item">직급: {userPosition}</div>}
                {userCompany && <div className="user-info-item">회사: {userCompany}</div>}
                <div className="user-info-item">연령대: 30대 중반</div>
                <div className="user-info-item">관심사: {interests}</div>
              </div>
            </div>
            <button className="view-details-link" onClick={handleViewDetails}>
              자세히 보기
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: showRationale ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
              >
                <path d="M6 12L10 8L6 4" stroke="#584cdc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Rationale Section - Inside the message bubble */}
            {showRationale && (
              <div className="rationale-section">
                <div className="rationale-header">
                  <div className="rationale-header-content">
                    <img 
                      src="https://www.figma.com/api/mcp/asset/c2072de6-f1a8-4f36-a042-2df786f153b1" 
                      alt="GPT-4b Logo" 
                      className="rationale-logo"
                    />
                    <h3 className="rationale-title">GPT-4b 추천 분석</h3>
                  </div>
                </div>
                <div className="rationale-cards">
                  {(rationaleCards.length > 0 ? rationaleCards : [{
                    id: 0,
                    title: '추천 근거',
                    description: personaString || '사용자 입력 기반 추천입니다.',
                  }]).map((item) => (
                    <div key={item.id} className="rationale-card">
                      <div className="rationale-card-content">
                        <h4 className="rationale-card-title">{item.title}</h4>
                        <p className="rationale-card-description">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gift Recommendations */}
          <div className="message-bubble ai-message">
            <p>{userName}님의 관심사를 고려하여 다음 선물들을 추천드립니다:</p>
            <div className="gift-recommendations">
              {recommendedGifts.length > 0 ? (
                recommendedGifts.map((gift, index) => {
                  const metadata = gift.metadata || {};
                  const giftName = metadata.name || metadata.product_name || '이름 없음';
                  const giftPrice = metadata.price ? `₩${parseInt(metadata.price).toLocaleString()}` : '가격 정보 없음';
                  const giftImage = metadata.image || '';
                  const giftCategory = metadata.category || '카테고리 없음';
                  const giftUrl = metadata.url || '#';
                  
                  const isSelected = selectedGiftIndex === index
                  const isDisabled = selectedGiftIndex !== null && selectedGiftIndex !== index
                  
                  return (
                    <div 
                      key={gift.id || index} 
                      className={`gift-recommendation-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    >
                      {isSelected && (
                        <div className="gift-selected-badge">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="10" fill="#10b981"/>
                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      {giftImage && (
                        <div className="gift-card-image">
                          <img src={giftImage} alt={giftName} onError={(e) => { e.target.style.display = 'none'; }} />
                          {isSelected && <div className="gift-image-overlay"></div>}
                        </div>
                      )}
                      <div className="gift-card-content">
                        <div className="gift-card-header">
                          <h3 className="gift-card-title">{giftName}</h3>
                          <span className="gift-card-category">{giftCategory}</span>
                        </div>
                        <div className="gift-card-bottom">
                          <span className="gift-card-price">{giftPrice}</span>
                          <a 
                            href={giftUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="gift-card-detail-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            상세 보기
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                        </div>
                        <button
                          className={`gift-select-button ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                          onClick={() => handleSelectGift(gift, index)}
                          disabled={isDisabled || isSavingGift}
                        >
                          {isSavingGift && isSelected ? (
                            <>
                              <svg className="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                                  <animate attributeName="stroke-dasharray" dur="1.5s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                                  <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                                </circle>
                              </svg>
                              <span>저장 중...</span>
                            </>
                          ) : isSelected ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span>선택됨</span>
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              <span>선택하기</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>추천된 선물이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Follow-up Question */}
          <div className="message-bubble ai-message">
            <p>혹시 추가 요청 사항이 있으신가요?</p>
          </div>

          {/* User Messages */}
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}>
              <p>{msg.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="input-bar">
          <button className="input-bar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="black" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <input
            type="text"
            className="message-input"
            placeholder="메시지를 입력하세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="send-button"
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GiftRecommendResultPage

