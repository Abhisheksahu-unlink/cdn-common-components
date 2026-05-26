@if(env('POINTS_PURCHASE_ENABLED', true))
    <section id="points-topup" class="stp-30 relative z-20">
      <div class="container">
        <points-purchase-form
            variant="cosmic"
                theme="dark"  
                layout="horizontal" 
                currency-symbol="{{ Helper::getCurrencySymbol(session('currency', 'USD')) }}"
                action="{{ route('points-add-to-cart') }}"
                csrf="{{ csrf_token() }}"
                button-text="Purchase Points"
                button-background="#2df4a1"
                button-color="#ffffff"
                border-radius="8px"
                topup-title="{{ __('common.points_topup_title') }}"
                topup-icon="{{ asset('assets/images/section-title-icon.png') }}"
                topup-tagline="{{ __('common.points_topup_tagline') }}"
                topup-intro="{{ __('common.points_topup_intro_1') }}"
                topup-disclaimer="{{ __('common.disclaimer') }}"
                recharge-title="{{ __('common.start_recharge_title') }}"
                recharge-text="{{ __('common.start_recharge_text') }}"
                tiers='[
                    {"min":1,"max":630,"multiplier":1,"label":"$1 - $630","benefit":"Standard points"},
                    {"min":631,"max":1880,"multiplier":1.5,"label":"$631 - $1,880","benefit":"50% extra points"},
                    {"min":1881,"max":3125,"multiplier":2,"label":"$1,881 - $3,125","benefit":"100% extra points"},
                    {"min":3126,"max":999999999,"multiplier":5,"label":"$3,126+","benefit":"400% extra points"}
                ]'
            ></points-purchase-form>         
      </div>
    </section>
    @endif