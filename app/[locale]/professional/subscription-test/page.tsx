'use client';

import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useCancelSubscription,
  useCreateCheckoutSession,
  useCreatePortalSession,
  useSubscriptionStatus,
} from '@/features/subscriptions/hooks';
import {
  SubscriptionStatus,
  SubscriptionStatusLabel,
  type SubscriptionStatus as SubscriptionStatusType,
} from '@/features/subscriptions/subscription.model';

export default function SubscriptionTestPage() {
  const locale = useLocale() as 'en' | 'fr';
  const searchParams = useSearchParams();

  const {
    data: subscriptionData,
    isLoading,
    refetch,
  } = useSubscriptionStatus();
  const createCheckout = useCreateCheckoutSession();
  const createPortal = useCreatePortalSession();
  const cancelSubscription = useCancelSubscription();

  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      refetch();
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setShowSuccess(false), 5000);
    }
    if (searchParams.get('canceled') === 'true') {
      setShowCanceled(true);
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setShowCanceled(false), 5000);
    }
  }, [searchParams, refetch]);

  const handleCreateCheckout = async () => {
    setIsCreatingCheckout(true);
    try {
      const result = await createCheckout.mutateAsync({
        cancelUrl: `${window.location.origin}/professional/subscription-test?canceled=true`,
        successUrl: `${window.location.origin}/professional/subscription-test?success=true`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to create checkout session');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleCreatePortal = async () => {
    setIsCreatingPortal(true);
    try {
      const result = await createPortal.mutateAsync({
        returnUrl: `${window.location.origin}/professional/subscription-test`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error creating portal:', error);
      alert('Failed to create portal session');
    } finally {
      setIsCreatingPortal(false);
    }
  };

  const handleCancelSubscription = async (cancelAtPeriodEnd: boolean) => {
    setIsCanceling(true);
    setCancelMessage(null);
    try {
      const result = await cancelSubscription.mutateAsync({
        cancelAtPeriodEnd,
      });
      setCancelMessage({
        message: result.message,
        type: 'success',
      });
      // Refetch after a short delay to allow webhook to process
      setTimeout(() => {
        refetch();
      }, 1000);
      setTimeout(() => setCancelMessage(null), 5000);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to cancel subscription';
      setCancelMessage({
        message: errorMessage,
        type: 'error',
      });
      setTimeout(() => setCancelMessage(null), 5000);
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusLabel = (status: null | SubscriptionStatusType) => {
    if (!status) return 'No subscription';
    return SubscriptionStatusLabel[locale][status];
  };

  const getStatusColor = (status: null | SubscriptionStatusType) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case SubscriptionStatus.active:
        return 'bg-green-100 text-green-800';
      case SubscriptionStatus.canceled:
        return 'bg-red-100 text-red-800';
      case SubscriptionStatus.past_due:
        return 'bg-yellow-100 text-yellow-800';
      case SubscriptionStatus.trialing:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6 bg-blue-50/30 p-8'>
      {/* Success/Cancel Messages */}
      {showSuccess && (
        <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-5 w-5 text-green-600' />
            <p className='text-sm font-medium text-green-800'>
              Checkout completed successfully! Your subscription status has been
              updated.
            </p>
          </div>
        </div>
      )}

      {showCanceled && (
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
          <div className='flex items-center gap-2'>
            <XCircle className='h-5 w-5 text-yellow-600' />
            <p className='text-sm font-medium text-yellow-800'>
              Checkout was canceled. No charges were made.
            </p>
          </div>
        </div>
      )}

      {cancelMessage && (
        <div
          className={`rounded-lg border p-4 ${
            cancelMessage.type === 'success'
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <div className='flex items-center gap-2'>
            {cancelMessage.type === 'success' ? (
              <CheckCircle2
                className={`h-5 w-5 ${
                  cancelMessage.type === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              />
            ) : (
              <XCircle
                className={`h-5 w-5 ${
                  cancelMessage?.type === 'error'
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              />
            )}
            <p
              className={`text-sm font-medium ${
                cancelMessage.type === 'success'
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}
            >
              {cancelMessage.message}
            </p>
          </div>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Subscription Test Page
          </h1>
          <p className='mt-2 text-gray-600'>
            Test subscription functionality - checkout, status, and portal
          </p>
        </div>
        <Button
          disabled={isLoading}
          onClick={() => refetch()}
          variant='outline'
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>
            Current subscription information for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
            </div>
          ) : subscriptionData ? (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  Status:
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                    subscriptionData.status
                  )}`}
                >
                  {getStatusLabel(subscriptionData.status)}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  Is Subscribed:
                </span>
                <span
                  className={`text-sm font-semibold ${
                    subscriptionData.isSubscribed
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {subscriptionData.isSubscribed ? 'Yes' : 'No'}
                </span>
              </div>

              {subscriptionData.subscription && (
                <div className='mt-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='font-medium text-gray-700'>
                        Subscription ID:
                      </span>
                      <p className='mt-1 font-mono text-xs text-gray-600'>
                        {subscriptionData.subscription.id}
                      </p>
                    </div>
                    <div>
                      <span className='font-medium text-gray-700'>
                        Stripe Subscription ID:
                      </span>
                      <p className='mt-1 font-mono text-xs text-gray-600'>
                        {subscriptionData.subscription.stripe_subscription_id}
                      </p>
                    </div>
                    {subscriptionData.subscription.current_period_start && (
                      <div>
                        <span className='font-medium text-gray-700'>
                          Current Period Start:
                        </span>
                        <p className='mt-1 text-gray-600'>
                          {new Date(
                            subscriptionData.subscription.current_period_start
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {subscriptionData.subscription.current_period_end && (
                      <div>
                        <span className='font-medium text-gray-700'>
                          Current Period End:
                        </span>
                        <p className='mt-1 text-gray-600'>
                          {new Date(
                            subscriptionData.subscription.current_period_end
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {subscriptionData.subscription.trial_end && (
                      <div>
                        <span className='font-medium text-gray-700'>
                          Trial End:
                        </span>
                        <p className='mt-1 text-gray-600'>
                          {new Date(
                            subscriptionData.subscription.trial_end
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className='font-medium text-gray-700'>
                        Cancel at Period End:
                      </span>
                      <p className='mt-1 text-gray-600'>
                        {subscriptionData.subscription.cancel_at_period_end
                          ? 'Yes'
                          : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!subscriptionData.subscription && (
                <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
                  <p className='text-sm text-yellow-800'>
                    No active subscription found. Create a subscription to get
                    started.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className='py-8 text-center text-gray-500'>
              Failed to load subscription status
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Manage your subscription or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <Button
              className='flex-1'
              disabled={isCreatingCheckout}
              onClick={handleCreateCheckout}
              size='lg'
            >
              {isCreatingCheckout ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <CreditCard className='mr-2 h-4 w-4' />
                  Create Checkout Session
                </>
              )}
            </Button>

            <Button
              className='flex-1'
              disabled={isCreatingPortal || !subscriptionData?.subscription}
              onClick={handleCreatePortal}
              size='lg'
              variant='outline'
            >
              {isCreatingPortal ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className='mr-2 h-4 w-4' />
                  Open Customer Portal
                </>
              )}
            </Button>
          </div>

          {subscriptionData?.subscription &&
            subscriptionData.subscription.status !== 'canceled' &&
            !subscriptionData.subscription.cancel_at_period_end && (
              <div className='mt-4 space-y-3'>
                <p className='text-sm font-medium text-gray-700'>
                  Cancel Subscription
                </p>
                <div className='flex flex-col gap-3 sm:flex-row'>
                  <Button
                    className='flex-1'
                    disabled={
                      isCanceling ||
                      !subscriptionData?.subscription ||
                      subscriptionData.subscription.status === 'canceled' ||
                      subscriptionData.subscription.cancel_at_period_end
                    }
                    onClick={() => handleCancelSubscription(true)}
                    size='lg'
                    variant='destructive'
                  >
                    {isCanceling ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Canceling...
                      </>
                    ) : (
                      <>
                        <Trash2 className='mr-2 h-4 w-4' />
                        Cancel at Period End
                      </>
                    )}
                  </Button>

                  <Button
                    className='flex-1'
                    disabled={
                      isCanceling ||
                      !subscriptionData?.subscription ||
                      subscriptionData.subscription.status === 'canceled' ||
                      subscriptionData.subscription.cancel_at_period_end
                    }
                    onClick={() => handleCancelSubscription(false)}
                    size='lg'
                    variant='destructive'
                  >
                    {isCanceling ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Canceling...
                      </>
                    ) : (
                      <>
                        <XCircle className='mr-2 h-4 w-4' />
                        Cancel Immediately
                      </>
                    )}
                  </Button>
                </div>
                <p className='text-xs text-gray-500'>
                  Cancel at Period End: Subscription remains active until the
                  end of the current billing period. Cancel Immediately:
                  Subscription is canceled right away.
                </p>
              </div>
            )}

          {subscriptionData?.subscription?.cancel_at_period_end && (
            <div className='mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
              <p className='text-sm text-yellow-800'>
                Your subscription is scheduled to cancel at the end of the
                current period (
                {subscriptionData.subscription.current_period_end
                  ? new Date(
                      subscriptionData.subscription.current_period_end
                    ).toLocaleDateString()
                  : 'N/A'}
                ).
              </p>
            </div>
          )}

          {!subscriptionData?.subscription && (
            <p className='mt-4 text-sm text-gray-500'>
              Customer portal is only available for existing subscriptions
            </p>
          )}
        </CardContent>
      </Card>

      {/* Raw Data Card (for debugging) */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Data (Debug)</CardTitle>
          <CardDescription>
            JSON representation of subscription data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className='max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100'>
            {JSON.stringify(subscriptionData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
