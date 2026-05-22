<forget-pwd-form
            class="auth-forms"
            action="{{ route('password.email') }}"
            csrf="{{ csrf_token() }}"
            theme="dark"
            border-radius="12px"
            register-url="{{ route('register.form') }}"
            email-placeholder="{{ __('common.email') }}"
            captcha-placeholder="{{ __('common.fill_captcha') }}"
            button-text="{{ __('common.submit') }}"
            dont-have-account-text="{{ __('common.dont_have_account') }}"
            sign-up-text="{{ __('common.sign_up') }}"
            success-message="{{ session('success') }}"
            error-message="{{ session('error') }}"
            captcha-error-message="@error('captcha') {{ $message }} @enderror"
            email-required-text="{{ __('common.email_required') }}"
            email-invalid-text="{{ __('common.email_invalid') }}"
            captcha-required-text="{{ __('common.fill_it') }}"
            >
            <div slot="captcha">
                @captcha
            </div>
</forget-pwd-form>