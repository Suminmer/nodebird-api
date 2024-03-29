// 라우터에 접근 권한을 제어하는 미들웨어 모듈
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(403).send('로그인 필요')
  }
}

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next()
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.')
    res.redirect(`/?error=${message}`)
  }
}

// API를 사용하려는 다른 사용자가 발급받은 토큰 인증
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')

exports.verifyToken = (req, res, next) => {
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
    return next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      //유효기간 초과
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다.'
      })
    }
    return res.status(401).json({
      code: 401,
      message: '유효하지 않은 토큰입니다.'
    })
  }
}

exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode, // 기본값 429
      message: '1분에 10번만 요청할 수 있습니다.'
    })
  }
})

exports.deprecated = (req, res) => {
  res.status(410).json({
    code: 410,
    message: '새로운 버전이 나왔습니다. 새로운 버전을 사용하세요.'
  })
}
