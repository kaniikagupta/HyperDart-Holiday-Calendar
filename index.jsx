import React, { useEffect, useState } from 'react'
import { withHD } from '@hyperdart/frontend'

const COUNTRY_CODES = {
  uk: 'GB',
  'united kingdom': 'GB',
  britain: 'GB',
  england: 'GB',

  usa: 'US',
  us: 'US',
  'united states': 'US',
  america: 'US',

  india: 'IN',
  canada: 'CA',
  australia: 'AU',
  germany: 'DE',
  france: 'FR',
  japan: 'JP',
  singapore: 'SG',
  uae: 'AE',
  'united arab emirates': 'AE',
  italy: 'IT',
  spain: 'ES',
  brazil: 'BR',
  mexico: 'MX',
  netherlands: 'NL',
  switzerland: 'CH',
  ireland: 'IE',
  'new zealand': 'NZ',
  china: 'CN',
  'south korea': 'KR',
  korea: 'KR'
}

function getCountryCode(query) {
  const lower = query.toLowerCase()

  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (lower.includes(name)) {
      return code
    }
  }

  return 'GB'
}

function getYear(query) {
  const match = query.match(/\b(20\d{2})\b/)

  if (match) {
    return Number(match[1])
  }

  return new Date().getFullYear()
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`)

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function HolidayCalendar(props) {
  const incomingQuery =
    props?.query ||
    props?.searchQuery ||
    props?.searchData?.query ||
    props?.data?.query ||
    'Public holidays in UK 2026'

  const [query, setQuery] = useState(incomingQuery)
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchHolidays = async (searchText = query) => {
    const text = searchText.trim()

    if (!text) {
      setError('Please enter a holiday query.')
      return
    }

    setLoading(true)
    setError('')
    setHolidays([])

    const countryCode = getCountryCode(text)
    const year = getYear(text)

    try {
      /*
       * Nager.Date public holiday API.
       *
       * Example:
       * https://nagerholidays.com/api/v4/Holidays/GB/2026
       */
      const url =
        `https://nagerholidays.com/api/v4/Holidays/` +
        `${countryCode}/${year}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Holiday API returned ${response.status}`
        )
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Invalid holiday data received.')
      }

      setHolidays(data)
    } catch (err) {
      console.error('Holiday API error:', err)

      setError(
        'Unable to fetch holiday data. Please check the country/year and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (incomingQuery) {
      setQuery(incomingQuery)
      fetchHolidays(incomingQuery)
    }
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    fetchHolidays(query)
  }

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '24px',
        fontFamily:
          'Arial, Helvetica, sans-serif',
        background: '#ffffff',
        color: '#1f2937'
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px'
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 500
              }}
            >
              Holiday Calendar
            </h2>

            <p
              style={{
                margin: '6px 0 0',
                color: '#6b7280',
                fontSize: '14px'
              }}
            >
              Find public holidays by country and year
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px'
          }}
        >
          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="e.g. Public holidays in UK 2026"
            style={{
              flex: 1,
              height: '42px',
              border: '1px solid #c7c7c7',
              borderRadius: '8px',
              padding: '0 14px',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              height: '42px',
              padding: '0 22px',
              border: 'none',
              borderRadius: '8px',
              background: '#ff5a3c',
              color: '#ffffff',
              fontWeight: 600,
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'LOADING...' : 'SEARCH'}
          </button>
        </form>

        {error && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '8px',
              background: '#fff3e0',
              color: '#b45309',
              marginBottom: '18px',
              fontSize: '14px'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {!loading &&
          !error &&
          holidays.length > 0 && (
            <div>
              <div
                style={{
                  marginBottom: '14px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}
              >
                {holidays.length} holidays found
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px'
                }}
              >
                {holidays.map((holiday, index) => (
                  <div
                    key={`${holiday.date}-${index}`}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '16px',
                      background: '#ffffff',
                      boxShadow:
                        '0 1px 3px rgba(0,0,0,0.08)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        marginBottom: '7px'
                      }}
                    >
                      {holiday.name}
                    </div>

                    <div
                      style={{
                        fontSize: '14px',
                        color: '#374151',
                        marginBottom: '6px'
                      }}
                    >
                      📅 {formatDate(holiday.date)}
                    </div>

                    {holiday.localName &&
                      holiday.localName !==
                        holiday.name && (
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#6b7280'
                          }}
                        >
                          {holiday.localName}
                        </div>
                      )}

                    {holiday.nationalHoliday !==
                      undefined && (
                      <div
                        style={{
                          marginTop: '10px',
                          fontSize: '12px',
                          color:
                            holiday.nationalHoliday
                              ? '#15803d'
                              : '#6b7280'
                        }}
                      >
                        {holiday.nationalHoliday
                          ? 'National holiday'
                          : 'Regional/optional holiday'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {!loading &&
          !error &&
          holidays.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '35px 20px',
                color: '#6b7280'
              }}
            >
              Enter a country and year to see holidays.
            </div>
          )}
      </div>
    </div>
  )
}

export default withHD(HolidayCalendar)