import { differenceInDays } from 'date-fns';
import { useMemo } from 'react';

import { useSubscriptionStatus } from './useSubscriptionStatus';

export const useRemainingTrialDays = () => {
  const { data: subscriptionData } = useSubscriptionStatus();

  const remainingDays = useMemo(() => {
    if (!subscriptionData?.subscription?.trial_end) {
      return null;
    }

    const trialEndDate = new Date(subscriptionData.subscription.trial_end);
    const now = new Date();
    const days = differenceInDays(trialEndDate, now);

    return days > 0 ? days : 0;
  }, [subscriptionData?.subscription?.trial_end]);

  return {
    isTrialActive:
      subscriptionData?.subscription?.status === 'trialing' &&
      remainingDays !== null &&
      remainingDays > 0,
    remainingDays,
  };
};
