import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './GiftRecommendResultPage.css'
import { giftAPI, chatAPI } from '../utils/api.js'

// 기본 선물 데이터 (API 응답이 없을 경우 폴백)
const fallbackGifts = [
  {
    id: 'fallback-1',
    name: '추천 선물을 찾지 못했습니다',
    price: '0',
    image: '',
    url: '#',
    category: '없음',
    brand: '',
    source: 'fallback'
  }
]

function GiftRecommendResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // 기본 정보
  const card = location.state?.card
  const additionalInfo = location.state?.additionalInfo || ''
  const memos = location.state?.memos || []
  
  // API 응답 데이터
  const recommendedGifts = location.state?.recommendedGifts || []
  const rationaleCards = location.state?.rationaleCards || []
  const personaString = location.state?.personaString || ''
  
  const [selectedGiftIndex, setSelectedGiftIndex] = useState(null)
  const [savedGiftId, setSavedGiftId] = useState(null) // 저장된 선물 ID
  const [isSavingGift, setIsSavingGift] = useState(false)
  const [isSavingChat, setIsSavingChat] = useState(false)
  const completionSectionRef = useRef(null)
  
  // 실제 표시할 선물 데이터 (API 응답 또는 폴백)
  const giftsToShow = recommendedGifts.length > 0 ? recommendedGifts : fallbackGifts

  // 선물 선택 시 완료 섹션으로 스크롤
  useEffect(() => {
    if (selectedGiftIndex !== null && completionSectionRef.current) {
      setTimeout(() => {
        completionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 100)
    }
  }, [selectedGiftIndex])

  const handleBack = () => {
    navigate(-1)
  }

  const handleGoHome = () => {
    navigate('/dashboard')
  }

  const handleGoToHistory = () => {
    navigate('/chat-history')
  }


  const handleSelectGift = async (gift, index) => {
    if (isSavingGift) return // 저장 중이면 무시
    
    if (!card?.id) {
      alert('명함 정보가 없어 선물을 저장할 수 없습니다.')
      return
    }

    // 같은 선물을 다시 클릭하면 선택 취소 (선택됨 버튼 클릭)
    if (selectedGiftIndex === index) {
      setIsSavingGift(true)
      
      // 저장된 선물이 있으면 삭제 시도 (에러가 나도 무시)
      if (savedGiftId) {
        try {
          await giftAPI.delete(savedGiftId)
        } catch (error) {
          console.error('Error deleting gift:', error)
          // 삭제 실패해도 선택 취소는 진행 (오류 메시지 표시 안 함)
        }
      }
      
      // 선택 취소
      setSelectedGiftIndex(null)
      setSavedGiftId(null)
      setIsSavingGift(false)
      return
    }

    // 다른 선물을 선택한 경우
    setIsSavingGift(true)
    
    // 기존에 저장된 선물이 있으면 삭제
    if (savedGiftId) {
      try {
        await giftAPI.delete(savedGiftId)
      } catch (error) {
        console.error('Error deleting previous gift:', error)
        // 삭제 실패해도 계속 진행
      }
    }

    setSelectedGiftIndex(index)

    try {
      // 선물 정보 추출 (metadata 또는 직접 속성)
      const metadata = gift.metadata || {}
      const giftName = gift.name || metadata.name || metadata.product_name || '이름 없음'
      const giftPrice = gift.price ? parseInt(gift.price) : (metadata.price ? parseInt(metadata.price) : null)
      const giftImage = gift.image || metadata.image || ''
      const giftCategory = gift.category || metadata.category || '카테고리 없음'
      const giftUrl = gift.url || metadata.url || ''
      
      // 선물 정보를 DB에 저장
      const response = await giftAPI.create({
        cardId: card.id,
        giftName: giftName,
        giftDescription: `${giftCategory} 카테고리의 선물`,
        giftImage: giftImage,
        price: giftPrice,
        category: giftCategory,
        notes: `선물 추천에서 선택된 선물: ${giftName}`
      })

      // 저장된 선물 ID 저장
      if (response.data && response.data.success && response.data.data) {
        setSavedGiftId(response.data.data.id)
      }

      // 전체 대화 내역 저장 (새로 선택한 경우에만)
      await saveChatHistory(gift, giftName, giftPrice, giftImage, giftCategory)
    } catch (error) {
      console.error('Error saving gift:', error)
      alert(error.response?.data?.message || '선물 저장 중 오류가 발생했습니다.')
      setSelectedGiftIndex(null) // 에러 시 선택 취소
      setSavedGiftId(null)
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
          content: `다음은 ${userName}님의 정보예요:\n- 이름: ${userName}\n${userCompany ? `- 소속: ${userCompany}\n` : ''}${userPosition ? `- 직급: ${userPosition}\n` : ''}- 메모: ${interests}${additionalInfo ? `\n- 추가 정보: ${additionalInfo}` : ''}`,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: `${userName}님의 관심사를 고려하여 다음 선물들을 추천드립니다:\n\n${giftsToShow.map((gift, idx) => {
            const name = gift.name || (gift.metadata?.name || gift.metadata?.product_name) || `선물 ${idx + 1}`;
            const price = gift.price ? `₩${Number(gift.price).toLocaleString()}` : (gift.metadata?.price ? `₩${parseInt(gift.metadata.price).toLocaleString()}` : '가격 정보 없음');
            const category = gift.category || gift.metadata?.category || '';
            const image = gift.image || gift.metadata?.image || '';
            const rationale = gift.rationale || gift.reason || (rationaleCards[idx]?.description) || (rationaleCards.length > 0 ? rationaleCards[0].description : '사용자 정보를 바탕으로 추천된 선물입니다.');
            return `${idx + 1}. ${name}\n${category ? `${category}\n` : ''}${price}\n${image ? `이미지: ${image}\n` : ''}추천 이유: ${rationale}`;
          }).join('\n\n')}`,
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

  // 추천 rationale 데이터 (API 응답 또는 기본값)
  const rationaleData = rationaleCards.length > 0 
    ? rationaleCards.map((card, index) => ({
        id: card.id || index + 1,
        title: card.title || '추천 이유',
        icon: getIconForCategory(card.title),
        description: card.description || ''
      }))
    : [
        {
          id: 1,
          title: '맞춤 추천',
          icon: '🎁',
          description: '입력하신 정보를 바탕으로 선물을 추천해드립니다.'
        }
      ]
  
  // 카테고리에 따른 아이콘 매핑
  function getIconForCategory(title) {
    if (!title) return '🎁'
    const iconMap = {
      '스포츠': '⛳',
      '레저': '🏃',
      '골프': '⛳',
      '와인': '🍷',
      '주류': '🍾',
      '식품': '🍽️',
      '뷰티': '💄',
      '패션': '👔',
      '전자': '📱',
      '가전': '🏠',
      '도서': '📚',
      '문화': '🎭',
      '여행': '✈️',
      '비즈니스': '💼',
      '생일': '🎂',
      '기념일': '💝'
    }
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (title.includes(key)) return icon
    }
    return '🎁'
  }

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
          <h2 className="header-title">
            {userPosition && userCompany ? (
              <>
                <span className="header-name">{userName}</span>
                <span className="header-company-position"> {userCompany} {userPosition}</span>
              </>
            ) : (
              `${userName}님을 위한 선물추천`
            )}
          </h2>
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
                {userCompany && <div className="user-info-item">소속: {userCompany}</div>}
                {userPosition && <div className="user-info-item">직급: {userPosition}</div>}
                <div className="user-info-item">연령대: 30대 중반</div>
                <div className="user-info-item">메모: {interests}</div>
                {additionalInfo && <div className="user-info-item">추가 정보: {additionalInfo}</div>}
              </div>
            </div>
          </div>

          {/* Gift Recommendations */}
          <div className="message-bubble ai-message">
            <div className="gift-recommendation-header">
              <img 
                src="/assets/gpt_4b_logo_blueberry.png" 
                alt="GPT-4b Logo" 
                className="gift-recommendation-logo"
              />
              <p>GPT-4b의 선물 추천</p>
            </div>
            <p className="gift-recommendation-subtitle">{userName}님의 관심사를 고려하여 다음 선물들을 추천드립니다:</p>
            {giftsToShow.length > 0 && giftsToShow[0].id !== 'fallback-1' ? (
              <div className="gift-recommendations">
                {giftsToShow.map((gift, index) => {
                  const giftName = gift.name || (gift.metadata?.name || gift.metadata?.product_name) || `선물 ${index + 1}`
                  // 각 선물의 추천 이유 (gift.rationale, gift.reason, 또는 rationaleCards에서 가져오기)
                  const rationale = gift.rationale || gift.reason || (rationaleCards[index]?.description) || (rationaleCards.length > 0 ? rationaleCards[0].description : '사용자 정보를 바탕으로 추천된 선물입니다.')
                  return (
                    <div key={gift.id} className={`gift-item-wrapper ${selectedGiftIndex === index ? 'selected' : ''} ${selectedGiftIndex !== null && selectedGiftIndex !== index ? 'disabled' : ''}`}>
                      <div className="gift-recommendation-card">
                        <div className="gift-card-image">
                          {gift.image ? (
                            <img 
                              src={gift.image} 
                              alt={gift.name}
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className="gift-card-image-placeholder" style={{ display: gift.image ? 'none' : 'flex' }}>
                            🎁
                          </div>
                        </div>
                        <div className="gift-card-content">
                          <div className="gift-card-header">
                          <h3 className="gift-card-title">{gift.name}</h3>
                            {gift.url && gift.url !== '#' ? (
                              <a 
                                href={gift.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="gift-card-detail-link"
                              >
                                상세 보기
                              </a>
                            ) : null}
                          </div>
                          <p className="gift-card-category">
                            {gift.category}
                            {gift.brand && ` · ${gift.brand}`}
                          </p>
                          <div className="gift-card-bottom">
                            <span className="gift-card-price">
                              ₩{Number(gift.price).toLocaleString()}
                              </span>
                            <button
                              className={`gift-select-button ${selectedGiftIndex === index ? 'selected' : ''}`}
                              onClick={() => handleSelectGift(gift, index)}
                              disabled={isSavingGift}
                            >
                              {selectedGiftIndex === index ? '선택됨' : '선택'}
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* 추천 이유 상자 */}
                      <div className="gift-rationale-box">
                        <div className="rationale-card">
                          <div className="rationale-card-content">
                            <p className="rationale-card-description">{rationale}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="no-gifts-message">
                <p>😢 조건에 맞는 선물을 찾지 못했습니다.</p>
                <p>검색 조건을 변경해서 다시 시도해보세요.</p>
              </div>
            )}
          </div>

          {/* Completion Message */}
          {selectedGiftIndex !== null && (
            <div className="completion-section" ref={completionSectionRef}>
              <div className="completion-message">
                <p className="completion-title">선물 선택이 완료되었습니다!</p>
                <p className="completion-subtitle">
                  "<span className="history-link" onClick={handleGoToHistory}>추천 내역</span>"에 선물 추천 내용이 저장됩니다.
                </p>
                <div className="completion-links">
                  <button className="completion-home-button" onClick={handleGoHome}>홈으로 가기</button>
          </div>
            </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default GiftRecommendResultPage

