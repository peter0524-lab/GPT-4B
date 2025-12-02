import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'
import { giftAPI } from '../utils/api'
import { isAuthenticated } from '../utils/auth'
import './CardGiftHistoryPage.css'

// 이미지 URL
const imgImageWithFallback = "https://www.figma.com/api/mcp/asset/22a17804-a225-448c-ad64-50983c1fa891"
const imgImageWithFallback1 = "https://www.figma.com/api/mcp/asset/3479ec16-6041-4bb0-be11-8808d8df88df"
const imgImageWithFallback2 = "https://www.figma.com/api/mcp/asset/3c2a8783-5233-4eeb-b511-684069144ba3"
const imgImageWithFallback3 = "https://www.figma.com/api/mcp/asset/c80efe8f-7bb1-4967-bf18-e4af3f5139e6"
const imgImageWithFallback4 = "https://www.figma.com/api/mcp/asset/e58eabb5-b484-4998-af61-7a34377ede25"
const imgIcon = "https://www.figma.com/api/mcp/asset/4559e990-44f1-4e81-b6c5-efd365a6f9d0"
const imgIcon1 = "https://www.figma.com/api/mcp/asset/fe12d10e-419c-476a-b374-b338c1dbe6ac"
const imgIcon2 = "https://www.figma.com/api/mcp/asset/8f3100aa-3650-47a0-a821-c71242a680d5"
const imgIcon3 = "https://www.figma.com/api/mcp/asset/1080043a-0fab-4492-95f0-0f0e5044b808"
const imgIcon4 = "https://www.figma.com/api/mcp/asset/988283d6-6878-4cbf-8f8a-db34ab956392"
const imgIcon5 = "https://www.figma.com/api/mcp/asset/a5dde2e3-0ba0-4ff7-aea7-b8a954df0490"
const imgIcon6 = "https://www.figma.com/api/mcp/asset/0636429d-fceb-48c6-8f3f-ef670746ab4a"
const imgIcon7 = "https://www.figma.com/api/mcp/asset/2f9bc1d1-6e2d-4be5-809b-b2b414fcd824"
const imgIcon8 = "https://www.figma.com/api/mcp/asset/506a72c8-4ef6-4dc5-9692-6ca8071e44e9"
const imgIcon9 = "https://www.figma.com/api/mcp/asset/9967873f-8e09-4acf-9f4b-eabdb6d4bbd3"
const imgVector4 = "https://www.figma.com/api/mcp/asset/9f59a389-f83e-4f13-b23f-43517aa98dce"

function CardGiftHistoryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // location.state에서 card 정보 가져오기
  const card = location.state?.card
  
  // 모든 선물에서 연도 추출 함수
  const getGiftYear = (gift) => {
    if (gift.year) return String(gift.year)
    if (gift.purchaseDate || gift.createdAt) {
      const date = new Date(gift.purchaseDate || gift.createdAt)
      return String(date.getFullYear())
    }
    return String(new Date().getFullYear())
  }

  // 사용 가능한 모든 연도 추출
  const availableYears = [...new Set(gifts.map(g => getGiftYear(g)))].sort((a, b) => b.localeCompare(a))
  
  // 초기 선택 연도
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  
  // gifts가 로드되면 가장 최근 연도로 자동 선택
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [gifts.length])
  
  const handleBack = () => {
    navigate(-1) // 이전 페이지로 돌아가기
  }

  // DB에서 해당 명함의 선물 이력 가져오기
  useEffect(() => {
    const fetchGifts = async () => {
      if (!isAuthenticated()) {
        setLoading(false)
        setError('로그인이 필요합니다.')
        return
      }

      if (!card || !card.id) {
        setLoading(false)
        setError('명함 정보가 없습니다.')
        return
      }

      setLoading(true)
      setError(null)

      try {
        // card.id를 숫자로 변환 (DB의 cardId는 INT 타입)
        // card.id가 문자열이거나 숫자일 수 있으므로 처리
        let cardId = card.id
        if (typeof cardId === 'string') {
          cardId = parseInt(cardId, 10)
          if (isNaN(cardId)) {
            throw new Error('Invalid card ID format')
          }
        }
        
        console.log('Fetching gifts for cardId:', cardId, 'card:', card) // 디버깅용
        console.log('Card ID type:', typeof card.id, 'value:', card.id) // 디버깅용
        
        // cardId를 쿼리 파라미터로 전달
        const response = await giftAPI.getAll({ cardId: String(cardId) })
        console.log('Gift API Response:', response.data) // 디버깅용
        console.log('API Request params:', { cardId: String(cardId) }) // 디버깅용
        
        if (response.data.success) {
          const giftsData = response.data.data || []
          console.log('Fetched gifts:', giftsData) // 디버깅용
          console.log('Gifts count:', giftsData.length) // 디버깅용
          
          // 각 선물의 cardId 확인
          giftsData.forEach((gift, index) => {
            console.log(`Gift ${index + 1}:`, {
              id: gift.id,
              cardId: gift.cardId,
              cardName: gift.cardName,
              giftName: gift.giftName
            })
          })
          
          setGifts(giftsData)
        } else {
          setError(response.data.message || '선물 이력을 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('Failed to fetch gifts:', err)
        console.error('Error details:', err.response?.data) // 디버깅용
        console.error('Card object:', card) // 디버깅용
        setError(err.response?.data?.message || err.message || '선물 이력을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchGifts()
  }, [card])

  // 날짜를 YYYY.MM.DD 형식으로 변환
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  // 가격을 원화 형식으로 변환
  const formatPrice = (price) => {
    if (!price) return '0원'
    return `${Number(price).toLocaleString('ko-KR')}원`
  }

  // 이미지 선택 (giftImage가 있으면 사용, 없으면 기본 이미지 순환)
  const getGiftImage = (index, giftImage) => {
    if (giftImage) return giftImage
    const images = [imgImageWithFallback, imgImageWithFallback1, imgImageWithFallback2, imgImageWithFallback3, imgImageWithFallback4]
    return images[index % images.length]
  }

  // 아이콘 선택 (명함 정보에 따라)
  const getGiftIcon = (index) => {
    const icons = [imgIcon, imgIcon2, imgIcon4, imgIcon5, imgIcon6]
    return icons[index % icons.length]
  }

  // 연도별로 필터링
  const giftHistoryByYear = gifts.filter(gift => {
    const giftYear = getGiftYear(gift)
    return giftYear === String(selectedYear)
  })
  
  // 연도별 개수 계산 (동적으로)
  const yearCounts = availableYears.reduce((acc, year) => {
    acc[year] = gifts.filter(g => getGiftYear(g) === year).length
    return acc
  }, {})
  
  console.log('Selected year:', selectedYear) // 디버깅용
  console.log('Total gifts:', gifts.length) // 디버깅용
  console.log('Available years:', availableYears) // 디버깅용
  console.log('Gifts by year:', giftHistoryByYear.length) // 디버깅용
  console.log('Year counts:', yearCounts) // 디버깅용

  // UI 형식으로 변환
  const giftHistory = giftHistoryByYear.map((gift, index) => ({
    id: gift.id,
    image: getGiftImage(index, gift.giftImage),
    icon: getGiftIcon(index),
    name: gift.cardName || card?.name || '이름 없음',
    position: gift.cardCompany || card?.company || '',
    giftName: gift.giftName || '선물',
    category: gift.category || '기타',
    status: '전달 완료',
    date: formatDate(gift.purchaseDate || gift.createdAt),
    price: formatPrice(gift.price)
  }))

  const cardGiftHistory = gifts

  return (
    <div className="card-gift-history-page">
      <div className="card-gift-history-container">
        {/* 헤더 */}
        <div className="card-gift-history-header">
          <button className="back-button" onClick={handleBack}>
            <div className="back-icon">
              <img src={imgVector4} alt="뒤로" />
            </div>
          </button>
          <h1 className="card-gift-history-title">
            {card ? `${card.name}님의 선물 이력` : '선물 이력'}
          </h1>
        </div>

        {/* 탭 리스트 */}
        {availableYears.length > 0 && (
          <div className="tab-list">
            {availableYears.map((year) => (
              <button
                key={year}
                className={`tab-button ${selectedYear === year ? 'active' : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}년 ({yearCounts[year] || 0})
              </button>
            ))}
          </div>
        )}

        {/* 선물 이력 리스트 */}
        <div className="gift-list">
          {loading ? (
            <div className="empty-gift-history">
              <p>로딩 중...</p>
            </div>
          ) : error ? (
            <div className="empty-gift-history">
              <p>{error}</p>
            </div>
          ) : giftHistory.length > 0 ? (
            giftHistory.map((gift) => (
              <div key={gift.id} className="gift-card">
                <div className="gift-card-content">
                  <div className="gift-image-wrapper">
                    <img src={gift.image} alt={gift.giftName} className="gift-image" />
                  </div>
                  <div className="gift-info">
                    <div className="gift-header">
                      <div className="gift-header-top">
                        <img src={gift.icon} alt="" className="gift-icon" />
                        <span className="gift-recipient-name">{gift.name}</span>
                        <span className="gift-recipient-position">{gift.position}</span>
                      </div>
                      <p className="gift-name">{gift.giftName}</p>
                    </div>
                    <div className="gift-badges">
                      <span className="category-badge">{gift.category}</span>
                      <span className="status-badge">{gift.status}</span>
                    </div>
                    <div className="gift-footer">
                      <div className="gift-date">
                        <img src={imgIcon1} alt="날짜" className="date-icon" />
                        <span>{gift.date}</span>
                      </div>
                      <span className="gift-price">{gift.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-gift-history">
              <p>선물 이력이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default CardGiftHistoryPage


