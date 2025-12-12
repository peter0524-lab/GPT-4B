import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'
import './WelcomeScreen.css'

function WelcomeScreen() {
  const navigate = useNavigate()
  const [showStats, setShowStats] = useState(false)
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    // 회사 통계 가져오기
    const fetchCompanyStats = async () => {
      try {
        const response = await authAPI.getCompanyStats()
        if (response.data.success && response.data.companies.length > 0) {
          setCompanies(response.data.companies)
        }
      } catch (error) {
        console.error('Failed to fetch company stats:', error)
      }
    }

    fetchCompanyStats()

    // 2초 후 통계 화면 표시
    const statsTimer = setTimeout(() => {
      setShowStats(true)
    }, 2000)

    // 5초 후 로그인 화면으로 이동
    const navTimer = setTimeout(() => {
      navigate('/login')
    }, 5000)

    return () => {
      clearTimeout(statsTimer)
      clearTimeout(navTimer)
    }
  }, [navigate])

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        {!showStats ? (
          <>
            <div className="logo-container">
              <img src="/assets/gpt_4b_logo_white.png" alt="GPT-4b Logo" className="logo" />
            </div>
            <div className="welcome-text">
              <p>GPT-4b가</p>
              <p>당신을 환영합니다</p>
            </div>
          </>
        ) : (
          <div className="stats-section">
            <div className="stats-header">
              <p className="stats-intro">현재 다양한 기업에서</p>
              <p className="stats-intro-highlight">GPT-4B를 사용중이에요 ✨</p>
            </div>
            
            {companies.length > 0 && (
              <div className="company-list">
                {companies.map((company, index) => (
                  <div key={index} className="company-item">
                    <div className="company-rank-badge">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <span className="company-name">{company.company.toUpperCase()}</span>
                    <span className="company-count">{company.userCount}명</span>
                  </div>
                ))}
              </div>
            )}

            <p className="stats-footer">함께 네트워킹을 시작해볼까요?</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WelcomeScreen
