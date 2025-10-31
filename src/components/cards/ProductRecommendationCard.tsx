// Product Recommendation Card Component
// Reusable card for displaying health product recommendations with consent controls
// Follows .cursorrules: <200 lines, single responsibility

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProductRecommendation } from '../../types/health';
import { theme } from '../../utils/theme';

interface ProductRecommendationCardProps {
  product: ProductRecommendation;
  onConsentGiven?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
  showConsentPrompt?: boolean;
  compact?: boolean;
}

export const ProductRecommendationCard: React.FC<ProductRecommendationCardProps> = ({
  product,
  onConsentGiven,
  onProductClick,
  showConsentPrompt = true,
  compact = false,
}) => {
  const [consentGiven, setConsentGiven] = useState(product.user_consent_given);
  const [expanded, setExpanded] = useState(false);

  const handleConsentClick = () => {
    setConsentGiven(true);
    onConsentGiven?.(product.id);
  };

  const handleProductClick = async () => {
    onProductClick?.(product.id);
    if (product.product_link) {
      await Linking.openURL(product.product_link);
    }
  };

  const getConfidenceColor = (score?: number): string => {
    if (!score) return theme.colors.textSecondary;
    if (score >= 0.8) return theme.colors.success;
    if (score >= 0.6) return theme.colors.warning;
    return theme.colors.textSecondary;
  };

  // Show consent prompt if required and not yet given
  if (showConsentPrompt && product.user_consent_required && !consentGiven) {
    return (
      <View style={styles.consentCard}>
        <Icon name="shield-checkmark-outline" size={32} color={theme.colors.primary} />
        <Text style={styles.consentTitle}>Product Recommendation Available</Text>
        <Text style={styles.consentText}>
          We have a product suggestion that may help with your symptoms. 
          Would you like to see it?
        </Text>
        <TouchableOpacity style={styles.consentButton} onPress={handleConsentClick}>
          <Text style={styles.consentButtonText}>Yes, show me</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineButton}>
          <Text style={styles.declineButtonText}>No thanks</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Compact view for inline recommendations
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handleProductClick}>
        {product.product_image_url && (
          <Image source={{ uri: product.product_image_url }} style={styles.compactImage} />
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{product.product_name}</Text>
          <Text style={styles.compactCategory}>{product.product_category}</Text>
          {product.price_range && (
            <Text style={styles.compactPrice}>{product.price_range}</Text>
          )}
        </View>
        <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  // Full product card view
  return (
    <View style={styles.card}>
      {/* Product Image */}
      {product.product_image_url && (
        <Image 
          source={{ uri: product.product_image_url }} 
          style={styles.productImage}
          resizeMode="cover"
        />
      )}

      {/* Product Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.productName}>{product.product_name}</Text>
          <Text style={styles.productCategory}>{product.product_category}</Text>
        </View>
        {product.confidence_score && (
          <View style={[styles.confidenceBadge, { borderColor: getConfidenceColor(product.confidence_score) }]}>
            <Text style={[styles.confidenceText, { color: getConfidenceColor(product.confidence_score) }]}>
              {Math.round(product.confidence_score * 100)}% match
            </Text>
          </View>
        )}
      </View>

      {/* Product Description */}
      {product.product_description && (
        <Text style={styles.description} numberOfLines={expanded ? undefined : 2}>
          {product.product_description}
        </Text>
      )}

      {/* Reasoning */}
      {product.reasoning && (
        <View style={styles.reasoningSection}>
          <Icon name="bulb-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.reasoningText}>{product.reasoning}</Text>
        </View>
      )}

      {/* Benefits */}
      {product.benefits && product.benefits.length > 0 && (
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Key Benefits:</Text>
          {product.benefits.slice(0, expanded ? undefined : 3).map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Price */}
      {product.price_range && (
        <Text style={styles.price}>{product.price_range}</Text>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {product.benefits && product.benefits.length > 3 && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.expandText}>
              {expanded ? 'Show less' : 'Show more'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.viewButton} onPress={handleProductClick}>
          <Text style={styles.viewButtonText}>View Product</Text>
          <Icon name="open-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        This is a suggestion only. Consult your healthcare provider before using any new products.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Consent Card Styles
  consentCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.subtle,
    marginVertical: theme.spacing.sm,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  consentText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  consentButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  consentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    paddingVertical: theme.spacing.xs,
  },
  declineButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },

  // Compact Card Styles
  compactCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.subtle,
    marginVertical: theme.spacing.xs,
  },
  compactImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  compactCategory: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  compactPrice: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Full Card Styles
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.subtle,
    marginVertical: theme.spacing.sm,
  },
  productImage: {
    width: '100%',
    height: 180,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  confidenceBadge: {
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  reasoningSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  reasoningText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  benefitsSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  expandText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    gap: 6,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    textAlign: 'center',
  },
});

