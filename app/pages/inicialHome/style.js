import { StyleSheet } from 'react-native';

export const estilos = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#FFF8C9',
},

cabecalho: {
position: 'absolute',
top: 0,
left: 0,
right: 0,
height: '47%',
backgroundColor: '#5DB582',
borderBottomLeftRadius: 55,
borderBottomRightRadius: 55,
},

conteudo: {
flex: 1,
paddingHorizontal: 36,
},

titulo: {
marginTop: 35,
marginBottom: 140,
paddingHorizontal: 5,
},

boasVindas: {
fontSize: 27,
color: '#000000',
fontWeight: '400',
},

nomeApp: {
fontSize: 48,
color: '#000000',
fontWeight: '500',
marginLeft: 30,
},

cartao: {
backgroundColor: '#FFFFFF',
borderRadius: 42,
paddingHorizontal: 28,
paddingTop: 48,
paddingBottom: 150,
marginHorizontal: -1,
elevation: 5,
shadowColor: '#000000',
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.10,
shadowRadius: 12,
},

pergunta: {
fontSize: 23,
lineHeight: 36,
color: '#000000',
textAlign: 'center',
marginBottom: 48,
},

opcao: {
flexDirection: 'row',
alignItems: 'center',
minHeight: 150,
borderWidth: 1.5,
borderColor: '#55B982',
borderRadius: 30,
paddingHorizontal: 20,
paddingVertical: 18,
marginBottom: 32,
},

circuloIcone: {
width: 88,
height: 88,
borderRadius: 50,
backgroundColor: '#D9F2C7',
alignItems: 'center',
justifyContent: 'center',
marginRight: 18,
},

textos: {
flex: 1,
justifyContent: 'center',
},

tituloOpcao: {
fontSize: 21,
color: '#000000',
fontWeight: '500',
marginBottom: 8,
},

descricao: {
fontSize: 15,
lineHeight: 22,
color: '#111111',
},

rodape: {
fontSize: 15,
lineHeight: 21,
color: '#000000',
textAlign: 'center',
marginTop: 'auto',
marginBottom: 28,
paddingHorizontal: 8,
},
});
