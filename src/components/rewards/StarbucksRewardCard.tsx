// Starbucks Reward Card Component
// Partnership rewards card with Starbucks branding

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface StarbucksRewardCardProps {
  pointsRequired: number;
  currentPoints: number;
  onRedeem?: () => void;
}

export const StarbucksRewardCard: React.FC<StarbucksRewardCardProps> = React.memo(({
  pointsRequired,
  currentPoints,
  onRedeem,
}) => {
  // Memoized calculations for performance
  const { canRedeem, progressPercent, pointsNeeded } = useMemo(() => ({
    canRedeem: currentPoints >= pointsRequired,
    progressPercent: Math.min((currentPoints / pointsRequired) * 100, 100),
    pointsNeeded: pointsRequired - currentPoints,
  }), [currentPoints, pointsRequired]);

  // Memoized button press handler
  const handleRedeem = useCallback(() => {
    if (canRedeem && onRedeem) {
      onRedeem();
    }
  }, [canRedeem, onRedeem]);
  
  return (
    <View style={styles.container}>
      <View style={styles.cardContent}>
        {/* Left: Starbucks Image - Strict Height Fit */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../assets/images/starbucks-optimized.jpg')}
            style={styles.starbucksImage}
            resizeMode="cover"
          />
        </View>
        
        {/* Right: All Content */}
        <View style={styles.contentSection}>
          {/* Reward Details */}
          <View style={styles.rewardDetails}>
            <Text style={styles.rewardTitle}>Free Coffee</Text>
            <Text style={styles.rewardDescription}>Any size, any drink</Text>
            
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  {currentPoints}/{pointsRequired} points
                </Text>
                <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
              </View>
              
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${progressPercent}%` }
                  ]} 
                />
              </View>
            </View>
            
            {/* Redeem Button */}
            <TouchableOpacity 
              style={[
                styles.redeemButton,
                canRedeem ? styles.redeemButtonActive : styles.redeemButtonDisabled
              ]}
              onPress={handleRedeem}
              disabled={!canRedeem}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.redeemButtonText,
                canRedeem ? styles.redeemButtonTextActive : styles.redeemButtonTextDisabled
              ]}>
                {canRedeem ? 'Redeem Now' : `${pointsNeeded} more points`}
              </Text>
              {canRedeem && (
                <Icon name="arrow-forward" size={16} color={theme.colors.cardBackground} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

// Add display name for better debugging
StarbucksRewardCard.displayName = 'StarbucksRewardCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground, borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg, overflow: 'hidden', ...theme.shadows.subtle,
  },
  cardContent: { flexDirection: 'row', height: 180 },
  imageContainer: {
    width: 110, 
    height: 180, 
    backgroundColor: '#f8f8f8', 
    overflow: 'hidden', 
    position: 'relative',
  },
  starbucksImage: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    width: 110, 
    height: 180,
  },
  contentSection: {
    flex: 1, padding: theme.spacing.base, justifyContent: 'flex-start',
  },
  rewardDetails: { flex: 1 },
  rewardTitle: {
    fontSize: theme.typography.medium, fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary, marginBottom: theme.spacing.xs,
  },
  rewardDescription: {
    fontSize: theme.typography.small, color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  progressSection: { marginBottom: theme.spacing.base },
  progressHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressLabel: { fontSize: theme.typography.xsmall, color: theme.colors.textSecondary },
  progressPercent: {
    fontSize: theme.typography.xsmall, fontWeight: theme.typography.weights.semibold,
    color: '#00704A',
  },
  progressTrack: {
    height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#00704A', borderRadius: 3 },
  redeemButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.base,
    borderRadius: theme.borderRadius.md, gap: theme.spacing.xs,
  },
  redeemButtonActive: { backgroundColor: '#00704A' },
  redeemButtonDisabled: { backgroundColor: theme.colors.border },
  redeemButtonText: {
    fontSize: theme.typography.small, fontWeight: theme.typography.weights.semibold,
  },
  redeemButtonTextActive: { color: theme.colors.cardBackground },
  redeemButtonTextDisabled: { color: theme.colors.textTertiary },
});
