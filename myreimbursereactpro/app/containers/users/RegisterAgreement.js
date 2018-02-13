/**
 * Created by Richard.ji on 2017/11/14.
 */

import React, {Component} from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Text,
    CheckBox,
    Platform,
    Image,
    StyleSheet,
    ScrollView
} from 'react-native';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {back} from '../../redux/actions/navigator/Navigator';
import Header from "./../common/CommonHeader";
import Message from "../../constant/Message";
import ScreenUtil from "../../utils/ScreenUtil";

class RegisterAgreement extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
    })


    /**
     * 返回
     * @param component 当前组件
     */
    onBack(component) {
        component.props.back();
    }

    render () {
        return (
            <View style={{flex:1, backgroundColor: '#F3F3F3'}}>
                <Header
                    titleText={Message.REGISTER_AGREEMENT}
                    thisComponent={this}
                    backClick={this.onBack}
                />
                <ScrollView style={{flex:1,paddingHorizontal:ScreenUtil.scaleSize(15)}}>
                    <Text style={styles.title1}>一、服务条款确认</Text>
                    <Text style={styles.content}>1.1  本协议是用户与大象慧云信息技术有限公司（简称“大象公司”）就大象公司提供的各项服务等相关事宜的所订立的契约。</Text>
                    <Text style={styles.content}>1.2  用户一旦点选“注册”并通过注册程序，或在各类登录页面中点选“确认登录”完成登录程序，即表示自愿接受所列之全部条款，能够独立承担使用大象公司服务过程中的全部法律责任。</Text>
                    <Text style={styles.content}>1.3  如果用户在18周岁以下，须在父母或其他法定监护人的监护参与下方可使用大象公司的各项服务。</Text>
                    <Text style={styles.content}>1.4  用户在完全同意本协议及情况下，方有权使用大象公司的各项服务。</Text>

                    <Text style={styles.title1}>二、自备设备确认</Text>
                    <Text style={styles.content}>2.1  大象公司通过互联网依法为用户提供互联网信息等服务，用户必须自行准备如下设备和承担如下开支：</Text>
                    <Text style={styles.content}>（1）上网设备，包括并不限于手机或者其他上网终端、调制解调器及其他必备的上网装置；</Text>
                    <Text style={styles.content}>（2）上网开支，包括并不限于网络接入费、上网设备租用费、手机流量费等。</Text>

                    <Text style={styles.title1}>三、用户账户及信息</Text>
                    <Text style={styles.content}>3.1  用户在注册账号或使用本服务的过程中，可能需要填写或提交一些必要的信息，如法律法规、规章规范性文件（以下称“法律法规”）规定的需要填写的身份信息。若用户提交的信息不完整或不符合法律法规的规定，则可能无法使用本服务或在使用本服务的过程中受到限制。</Text>
                    <Text style={styles.content}>3.2  用户在注册账号或使用本服务的过程中，可能需要填写或提交一些隐私信息和非隐私信息。隐私信息是指涉及用户身份或隐私的信息，比如，用户名称、相关证件号码、电话号码、邮箱、IP地址。非隐私信息是指用户对本服务的操作状态以及使用习惯等明确且客观反映在服务器端的基本记录信息、隐私信息范围外的其它普通信息，以及用户同意公开的上述隐私信息。</Text>
                    <Text style={styles.content}>3.3  本服务在用户使用的过程中，可能会收集、储存和使用与您有关的信息，包括但不限于产品登录记录、发票和单据记录、产品日志和用户使用记录、产品客户服务记录等；也可能将您的个人信息与合作伙伴及第三方服务供应商、承包商及代理分享，用于向您提供服务、履行服务商和用户在协议中的义务、行使服务商和用户的权利、对服务进行维护和改善等。</Text>
                    <Text style={styles.content}>3.4  大象公司可采取技术措施和其他必要措施，确保用户隐私信息安全，防止在服务中收集的用户隐私信息泄露、毁损或丢失。在发生前述情形或者发现存在发生前述情形的可能时，大象公司将及时采取补救措施。</Text>
                    <Text style={styles.content}>3.5  大象公司未经用户同意不会向任何第三方公开、透露用户隐私信息。但以下特定情形除外：</Text>
                    <Text style={styles.content}>（1）大象公司根据法律法规规定向有关部门提供用户信息；</Text>
                    <Text style={styles.content}>（2）由于用户将其密码或其它账户和个人信息告知他人，由此导致的任何信息的泄漏，或其它非因大象公司原因导致的隐私信息的泄露；</Text>
                    <Text style={styles.content}>（3）用户自行向第三方公开其隐私信息；</Text>
                    <Text style={styles.content}>（4）任何由于黑客攻击、电脑病毒侵入及其他不可抗力事件导致用户隐私信息的泄露。</Text>
                    <Text style={styles.content}>3.6  大象公司可在以下事项中使用用户的隐私信息：</Text>
                    <Text style={styles.content}>（1）大象公司向用户及时发送重要通知，如软件更新、本协议条款的变更和其它重要活动等；</Text>
                    <Text style={styles.content}>（2）大象公司内部进行审计、数据分析和研究等，和用以改进其产品、服务的和用户之间的沟通；</Text>
                    <Text style={styles.content}>（3）适用法律法规规定的其他事项。</Text>
                    <Text style={styles.content}>（4）除上述事项外，如未取得用户事先同意，大象公司不会将用户个人隐私信息使用于任何其他用途。</Text>

                    <Text style={styles.title1}>四、用户义务</Text>
                    <Text style={styles.content}>4.1  用户不得利用大象公司提供的各项服务所涉及的平台制作、上载、复制、发布、传播如下法律、法规和政策禁止的内容：</Text>
                    <Text style={styles.content}>（1）反对宪法所确定的基本原则的；</Text>
                    <Text style={styles.content}>（2）危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；</Text>
                    <Text style={styles.content}>（3）损害国家荣誉和利益的；</Text>
                    <Text style={styles.content}>（4）煽动民族仇恨、民族歧视，破坏民族团结的；</Text>
                    <Text style={styles.content}>（5）破坏国家宗教政策，宣扬邪教和封建迷信的；</Text>
                    <Text style={styles.content}>（6）散布谣言，扰乱社会秩序，破坏社会稳定的；</Text>
                    <Text style={styles.content}>（7）散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；</Text>
                    <Text style={styles.content}>（8）侮辱或者诽谤他人，侵害他人合法权益的。</Text>
                    <Text style={styles.content}>4.2  用户不得利用大象公司提供的各项服务制作、上载、复制、发布、传播如下干扰服务正常运营以及侵犯第三方合法权益的内容：</Text>
                    <Text style={styles.content}>（1）含有任何性或性暗示的；</Text>
                    <Text style={styles.content}>（2）含有辱骂、恐吓、威胁内容的；</Text>
                    <Text style={styles.content}>（3）含有骚扰、垃圾广告、恶意信息、诱骗信息的；</Text>
                    <Text style={styles.content}>（4）涉及他人隐私、个人信息或资料的；</Text>
                    <Text style={styles.content}>（5）侵害他人名誉权、肖像权、知识产权、商业秘密等合法权利的；</Text>
                    <Text style={styles.content}>（6）含有其他干扰本服务正常运营和侵犯其他用户合法权益内容的信息；</Text>
                    <Text style={styles.content}>（7）含有法律、法规以及任何强制性规范所限制或禁止的其它内容的。</Text>
                    <Text style={styles.content}>4.3  用户在本服务中或通过本服务所传送、发布的任何内容并不反映或代表，也不得被视为反映或代表大象公司以及本服务的观点、立场或政策，大象公司以及本服务对此不承担任何责任。</Text>
                    <Text style={styles.content}>4.4  用户须对使用本服务过程中传送信息的真实性、合法性、无害性、准确性、有效性等全权负责。用户不可伪造大象公司的所提供的任何服务的来源，不可假冒他人、或假冒代表他人，或模仿任何其他个人或实体。与用户传播的信息相关的任何法律责任由用户自行承担，与大象公司无关。</Text>
                    <Text style={styles.content}>4.5  用户不可试图通过非法侵入、“破解”密码或任何其他非法方式，未经授权访问大象公司所提供的服务的任何部分或功能，或者链接至服务提供设备的任何其他系统或网络，不可以违反大象公司提供服务的任何网络的安全或认证措施。用户同意不使用任何设备、软件或程序，干扰或试图干扰大象公司提供的各项服务，或干扰或试图干扰他人使用服务。</Text>
                    <Text style={styles.content}>4.6  大象公司提供的服务中可能包括广告，用户同意在使用过程中显示大象公司以及与大象公司合作的第三方供应商、合作伙伴提供的广告。除法律法规明确规定外，用户应自行对依该广告信息进行的交易负责，对用户因依该广告信息进行的交易或前述广告商提供的内容而遭受的损失或损害，大象公司不承担任何责任。</Text>

                    <Text style={styles.title1}>五、账号和数据管理</Text>
                    <Text style={styles.content}>5.1  大象公司具有所提供的各项服务的账号所有权。用户完成注册流程后，获得所注册账号的使用权。该账号仅限申请人使用，禁止赠与、借用、租用、转让或售卖。用户应在使用账号时，如违反法律法规和相关协议，大象公司有权终止对违法违约用户的服务，对该用户账号进行回收。</Text>
                    <Text style={styles.content}>5.2  用户应妥善保管注册账号、密码以及其它账号信息的安全，因用户保管不善导致的账号、密码以及其它账号信息失窃，责任由用户自行承担。用户不得在未经允许的情况下使用他人账号。当用户怀疑他人在大象公司的各项服务中，不正当使用账号、密码和其它账号信息时，应立即通知大象公司。</Text>
                    <Text style={styles.content}>5.3  大象公司可以根据实际情况自行决定对用户在服务中的数据最长存储期限，并在服务器上为其分配存储空间。用户应根据需要自行备份服务数据，应对在使用服务过程中对数据的修改和删除负责。如本服务终止，或用户终止使用本服务，大象公司有权在服务器上永久删除该用户账号数据。服务终止后，大象公司没有义务向用户返还数据。</Text>

                    <Text style={styles.title1}>六、风险承担和免责声明</Text>
                    <Text style={styles.content}>6.1  用户理解并同意，在使用本服务的过程中，可能会遇到不可抗力等风险因素，使本服务发生中断。不可抗力是指不能预见、不能克服并不能避免且对一方或双方造成重大影响的客观事件，包括但不限于自然灾害如洪水、地震、瘟疫流行和风暴等以及社会事件如战争、动乱、政府行为等。出现上述情况时，大象公司将努力在第一时间与相关单位配合，及时进行修复，但是由此给用户造成的损失法律允许的范围内免责。</Text>
                    <Text style={styles.content}>6.2  本服务受包括但不限于网络服务质量、自然和社会环境等因素的影响，可能受到各种安全问题的侵扰，例如计算机病毒、黑客攻击、互联网网络和通信线路等原因造成的网络中断等，同时大象公司需要定期或不定期对所提供服务及其设备进行检修和维护，因以上原因造成的服务中断或不能满足用户要求的风险，并导致的用户任何损失，大象公司不承担任何责任。</Text>
                    <Text style={styles.content}>6.3  用户理解并确认，在使用本服务过程中，存在来源于第三方个人或团体的误导性的、欺骗性的、威胁性的、诽谤性的、令人反感的或非法的信息，以及伴随该信息的行为，大象公司不对以上任何信息的真实性、适用性、合法性承担责任，也不对因侵权行为给用户造成的损害负责。</Text>

                    <Text style={styles.title1}>七、知识产权声明</Text>
                    <Text style={styles.content}>7.1  用户一旦接受本协议，即表明该用户主动将其在任何时间段在大象公司所提供的服务中发表的任何形式的信息内容（包括但不限于各类评论、话题文章和操作记录等信息内容）的财产性权利等任何可转让的权利，如著作权财产权（包括并不限于：复制权、发行权、出租权、展览权、表演权、放映权、广播权、信息网络传播权、摄制权、改编权、翻译权、汇编权以及应当由著作权人享有的其他可转让权利），全部独家且不可撤销地转让给大象公司所有，用户同意大象公司有权就任何主体侵权而单独提起诉讼。</Text>
                    <Text style={styles.content}>7.2  大象公司所提供的各项服务，内容及资源的著作权等合法权利归大象公司所有，受国家法律保护，大象公司有权不时地对其提供的服务予以变更，并在服务中张贴或向用户发送关于服务变更的通知。用户不得更改、删除大象公司所提供的服务上关于著作权的信息，不得以任何方式尝试复制、转载、引用、链接、抓取或以其他方式使用大象公司所提供服务的各项信息内容，也不得通过伪造运行指令等方式改变大象公司所提供服务的功能和运行结果，无论是否为商业目的。</Text>

                    <Text style={styles.title1}>八、服务的变更、中断、终止</Text>
                    <Text style={styles.content}>8.1  如发生下列任何一种情形，大象公司有权不经通知而中断或终止向用户提供的服务：</Text>
                    <Text style={styles.content}>（1）根据法律规定用户应提交真实信息，而用户提供的个人资料不真实、或与注册时信息不一致又未能提供合理证明；</Text>
                    <Text style={styles.content}>（2）用户违反相关法律法规或本协议的约定；</Text>
                    <Text style={styles.content}>（3）按照法律规定或主管部门的要求；</Text>
                    <Text style={styles.content}>（4）出于安全的原因或其他必要的情形。</Text>

                    <Text style={styles.title1}>九、其他</Text>
                    <Text style={styles.content}>9.1  本协议的效力、解释及纠纷的解决，适用于中华人民共和国法律。若大象公司和用户之间发生任何纠纷或争议，首先应友好协商解决，协商不成的，用户同意将纠纷或争议提交大象公司住所地有管辖权的人民法院管辖。</Text>
                    <Text style={styles.content}>9.2  用户正确提交注册或登录程序所需的资料并确认本协议，通过注册或登录程序后，本协议在大象公司所提供的服务与用户之间成立并生效。本服务协议具有合同法上的法律效力。协议有效期从用户同意本协议并通过注册或登录程序开始，至注销用户账号或服务终止时结束。</Text>
                    <Text style={styles.content}>9.3  用户已经仔细阅读本协议内容，并理解其中的法律含义。若用户在阅读或使用本协议是有任何问题，或对本协议或服务内容有任何意见或建议，可与大象公司联系，用户将会得到必要的帮助。</Text>
                </ScrollView>
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        state:state.RegisterAgreement
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        back:back,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterAgreement);

const styles = StyleSheet.create({
    title:{
        fontWeight:'bold',
        fontSize:ScreenUtil.scaleSize(18),
        textAlign:'center',
        includeFontPadding:false,
        padding:ScreenUtil.scaleSize(20),
    },
    title1:{
        fontWeight:'bold',
        fontSize:ScreenUtil.scaleSize(16),
        textAlign:'left',
        includeFontPadding:false,
        paddingTop:ScreenUtil.scaleSize(15),
        paddingBottom:ScreenUtil.scaleSize(8),
    },
    content:{
        fontSize:ScreenUtil.scaleSize(14),
        textAlign:'left',
        includeFontPadding:false,
        paddingTop:ScreenUtil.scaleSize(8),
        lineHeight:ScreenUtil.scaleSize(18),
    }
});