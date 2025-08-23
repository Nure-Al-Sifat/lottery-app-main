import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { NFT_METADATA_BASE_URL } from '@/lib/contracts'

interface NFTMetadataProps {
  tokenId: bigint
  className?: string
}

interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  edition?: string
}

export const NFTMetadata = ({ tokenId, className }: NFTMetadataProps) => {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${NFT_METADATA_BASE_URL}/${tokenId.toString()}.json`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch metadata')
        }
        
        const data = await response.json()
        setMetadata(data)
      } catch (err) {
        console.error('Error fetching NFT metadata:', err)
        setError('Failed to load NFT metadata')
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [tokenId])

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-48 bg-muted rounded-lg mb-4" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !metadata) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">{error || 'No metadata available'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {metadata.image && (
          <div className="mb-4">
            <img
              src={metadata.image}
              alt={metadata.name}
              className="w-full h-auto object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{metadata.name}</h3>
            <p className="text-sm text-muted-foreground">{metadata.description}</p>
          </div>

          {metadata.edition && (
            <Badge variant="secondary">
              Edition: {metadata.edition}
            </Badge>
          )}

          {metadata.attributes && metadata.attributes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Attributes</h4>
              <div className="grid grid-cols-2 gap-2">
                {metadata.attributes.map((attr, index) => (
                  <div key={index} className="bg-muted rounded-lg p-2">
                    <div className="text-xs text-muted-foreground">{attr.trait_type}</div>
                    <div className="text-sm font-medium">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <a
            href={`${NFT_METADATA_BASE_URL}/${tokenId.toString()}.json`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            View JSON
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}